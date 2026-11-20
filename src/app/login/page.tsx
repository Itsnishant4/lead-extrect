import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (session) {
    redirect("/leads")
  }

  return (
    <main className="min-h-screen">
      <LoginForm />
    </main>
  )
}
