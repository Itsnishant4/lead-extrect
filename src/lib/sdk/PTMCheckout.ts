/**
 * PTMCheckout SDK
 * Modular, reusable logic for managing payment gateway iframe and lifecycle.
 */

export interface PTMOptions {
  payment_url: string;
  order_id: string;
  gateway_origin: string;
  checkStatus?: (orderId: string) => Promise<string>;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
}

export class PTMCheckout {
  private options: PTMOptions;
  private modal: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private pollingInterval: any = null;
  private timeoutId: any = null;

  constructor(options: PTMOptions) {
    this.options = {
      timeout: 300000, // Default 5 minutes
      ...options
    };
  }

  /**
   * Public API: Open the payment modal
   */
  public open(): void {
    if (this.modal) return;

    this.createUI();
    this.bindEvents();
    this.startLifecycle();
  }

  /**
   * Public API: Close and cleanup the modal
   */
  public close(): void {
    this.cleanup();
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  private createUI(): void {
    // 1. Create Overlay
    this.modal = document.createElement('div');
    Object.assign(this.modal.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      backgroundColor: '#00000000',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      opacity: '0',
      transition: 'opacity 0.2s ease-out'
    });

    // 2. Create Close Button
    // const closeBtn = document.createElement('button');
    // closeBtn.innerHTML = '&times;';
    // Object.assign(closeBtn.style, {
    //   position: 'absolute',
    //   top: '20px',
    //   right: '20px',
    //   width: '40px',
    //   height: '40px',
    //   borderRadius: '50%',
    //   backgroundColor: 'white',
    //   border: 'none',
    //   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    //   fontSize: '24px',
    //   cursor: 'pointer',
    //   zIndex: '10001',
    //   display: 'flex',
    //   alignItems: 'center',
    //   justifyContent: 'center'
    // });
    // closeBtn.onclick = () => this.close();

    // 3. Create Iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.options.payment_url;
    Object.assign(this.iframe.style, {
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.0  )',
      backgroundColor: 'transparent'
    });
    this.iframe.setAttribute('allow', 'payment');

    // this.modal.appendChild(closeBtn);
    this.modal.appendChild(this.iframe);
    document.body.appendChild(this.modal);

    // Fade in
    setTimeout(() => {
      if (this.modal) this.modal.style.opacity = '1';
    }, 10);
  }

  private bindEvents(): void {
    window.addEventListener('message', this.handleMessage);
    window.addEventListener('keydown', this.handleKeydown);
  }

  private handleMessage = (event: MessageEvent) => {
    // Validate Origin
    if (event.origin !== this.options.gateway_origin) return;

    const data = event.data;

    if (data?.type !== 'PTM_EVENT') return;

    const { status } = data;

    if (status === 'success') {
      this.handleSuccess(data);
    }

    if (status === 'failed') {
      this.cleanup();
      this.options.onFailure?.(data);
    }

    if (status === 'cancelled' || status === 'expired') {
      this.cleanup();
      this.options.onClose?.();
    }
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.close();
    }
  };

  private startLifecycle(): void {
    // 1. Polling Fallback
    if (this.options.checkStatus) {
      this.pollingInterval = setInterval(async () => {
        try {
          const status = await this.options.checkStatus!(this.options.order_id);
          if (status === 'paid') {
            this.handleSuccess({ order_id: this.options.order_id });
          }
        } catch (err) {
          console.error('[PTM SDK] Polling failed:', err);
        }
      }, 3000);
    }

    // 2. Timeout
    if (this.options.timeout) {
      this.timeoutId = setTimeout(() => {
        console.warn('[PTM SDK] Payment session timed out');
        this.close();
      }, this.options.timeout);
    }
  }

  private handleSuccess(data: any): void {
    this.cleanup();
    if (this.options.onSuccess) {
      this.options.onSuccess(data);
    }
  }


  private cleanup(): void {
    // Remove listeners
    window.removeEventListener('message', this.handleMessage);
    window.removeEventListener('keydown', this.handleKeydown);

    // Clear timers
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.timeoutId) clearTimeout(this.timeoutId);

    // Remove UI with fade out
    if (this.modal) {
      this.modal.style.opacity = '0';
      const m = this.modal;
      setTimeout(() => {
        if (m.parentNode) m.parentNode.removeChild(m);
      }, 200);
      this.modal = null;
      this.iframe = null;
    }
  }
}
