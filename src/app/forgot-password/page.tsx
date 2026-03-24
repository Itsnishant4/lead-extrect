import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (session) {
    redirect("/leads")
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-10 top-24 h-56 w-56 rounded-full bg-muted/40 blur-3xl" />
      </div>
      <div className="w-full max-w-5xl">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
