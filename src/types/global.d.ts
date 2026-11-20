// Global type declarations for analytics tracking

export {};

declare global {
  interface Window {
    trackEvent: (eventName: string, params?: Record<string, string | number>) => void;
    trackSignupStart: (method: string) => void;
    trackFirstLead: (leadSource: string) => void;
    trackUpgradeClick: (planType: string) => void;
  }
}

declare module "*.lottie" {
  const value: string;
  export default value;
}
