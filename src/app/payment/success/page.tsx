"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const allowedOrigin = searchParams.get('origin');

    if (window.parent !== window) {
      if (!allowedOrigin) {
        console.error('❌ Missing origin param');
        return;
      }
      // Notify parent window (iframe host) that payment succeeded
      window.parent.postMessage({ type: "PTM_EVENT", status: "success" }, allowedOrigin);
      // Fallback: try to navigate the parent directly
      setTimeout(() => {
        try {
          window.parent.location.href = '/subscription';
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    } else {
      // If opened in top window, redirect to dashboard
      setTimeout(() => {
        window.location.href = '/subscription';
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4 p-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Your plan has been activated. This window will close automatically.
        </p>
      </div>
    </div>
  );
}
