"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signupAction } from "@/app/actions"
import { toast } from "sonner"
import { Eye, EyeSlash } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Logo } from "./Logo"
import { QuoteCarousel } from "./quote-carousel"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const result = await signupAction(name, email, password)
      if (result.success) {
        toast.success("Account created successfully")
        queryClient.invalidateQueries()
        router.push("/leads")
        router.refresh()
      } else {
        toast.error((result as any).error || "Failed to create account")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid min-h-screen bg-white grid-cols-1 md:grid-cols-[1fr_1.6fr] relative", className)} {...props}>
      <div className="bg-[#F8F8F8] z-1  shadow-2xl broder-r border flex h-screen justify-center items-center">
      <div className="absolute top-8 left-8 z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-[#6366f1]" />
          <span className="text-xl font-bold tracking-tight text-slate-900">leadspotter</span>
        </div>
      </div>

      {/* Left Column: Form */}
      <div className="flex flex-col p-8 md:p-12 lg:p-16 justify-center">
        <div className="flex flex-col justify-center max-w-sm mx-auto w-full my-12 md:my-16 lg:my-20">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Get started</h1>
            <p className="text-slate-500 font-medium">Create a new account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" title="At least 8 characters" className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2  bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold rounded-lg transition-all shadow-sm shadow-[#6366f1]/20"
              disabled={isLoading}
              >
              {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : "Sign up"}
            </Button>

            <p className="text-sm text-center text-slate-500 font-medium pt-4">
              Already have an account?{" "}
              <a href="/login" className="text-slate-900 border-b border-slate-300 pb-0.5 font-bold hover:border-slate-900 transition-all">Sign in</a>
            </p>
          </form>
        </div>

        {/* Footer Links - Centered */}
        <div className="">
          <p className="text-[10px] leading-relaxed text-slate-400 max-w-sm mx-auto text-center">
            By continuing, you agree to LeadSpotter's <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a> and <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>, and to receive periodic emails with updates.
          </p>
        </div>
      </div>
              </div>

      {/* Right Column: Social Proof */}
      <div className="hidden z-0 md:flex flex-col bg-white border-l border-slate-100 p-12 lg:p-20 justify-center relative overflow-hidden">
        <QuoteCarousel pagetype="signup" />
      </div>
    </div>
  )
}
