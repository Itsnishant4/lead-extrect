"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Notify parent window (iframe host) that payment succeeded
    if (window.parent !== window) {
      window.parent.postMessage({ type: "PAYMENT_SUCCESS" }, "*");
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
