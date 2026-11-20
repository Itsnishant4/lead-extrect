"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/app/actions"
import { toast } from "sonner"
import { Eye, EyeSlash } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Logo } from "./Logo"
import { QuoteCarousel } from "./quote-carousel"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false)

  // Show welcome message from Google login
  useEffect(() => {
    const welcome = searchParams.get('welcome')
    const error = searchParams.get('error')

    if (welcome === 'google') {
      toast.success("Welcome! You've been logged in with Google.")
      router.push("/leads")
    }
    if (error) {
      toast.error(`Login failed: ${error}`)
    }
  }, [searchParams, router])

  // Initialize Google Sign-In
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeGoogle = () => {
      // @ts-ignore
      if (window.google?.accounts?.id) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          // Disable FedCM to avoid NetworkError in some browsers
          use_fedcm_for_prompt: false,
        })

        // Render the button
        // @ts-ignore
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            text: 'signin_with',
            logo_alignment: 'left',
            width: 400,
          }
        )

        setIsGoogleInitialized(true)
      }
    }


    if (!document.getElementById('google-identity-services')) {
      const script = document.createElement('script')
      script.id = 'google-identity-services'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      document.head.appendChild(script)
    } else {
      initializeGoogle()
    }
  }, [])

  const handleGoogleClick = () => {
    // @ts-ignore
    if (window.google?.accounts?.id) {
      // Use the popup flow instead of One Tap to avoid FedCM errors
      // @ts-ignore
      window.google.accounts.id.prompt((notification) => {
        // If One Tap fails or is dismissed, the button click should still work
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap not available - user can still use the button
          console.log('One Tap not displayed, using button flow')
        }
      })
    }
  }

  // @ts-ignore
  const handleGoogleResponse = async (response) => {
    if (!response.credential) {
      toast.error('Google login failed')
      return
    }

    setIsGoogleLoading(true)
    try {
      // Decode JWT to get email and name
      const payload = JSON.parse(atob(response.credential.split('.')[1]))

      // Send the token to our backend
      const res = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      })

      if (res.redirected) {
        window.location.href = res.url
        return
      }

      const data = await res.json()
      if (data.success) {
        toast.success("Welcome! You've been logged in with Google.")
        queryClient.invalidateQueries()
        router.push("/leads")
        router.refresh()
      } else {
        toast.error(data.error || 'Google login failed')
      }
    } catch (error) {
      toast.error('Google login failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await loginAction(email, password)
      if (result.success) {
        toast.success("Logged in successfully")
        queryClient.invalidateQueries()
        router.push("/leads")
        router.refresh()
      } else {
        toast.error((result as any).error || "Invalid credentials")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid min-h-screen grid-cols-1 md:grid-cols-[1fr_1.6fr] relative", className)} {...props}>

      <div className="bg-[#F8F8F8] z-1 shadow-2xl broder-r border flex h-screen justify-center items-center">
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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h1>
              <p className="text-slate-500 font-medium">Sign in to your account</p>
            </div>

            {/* Google Sign-In Button */}
            <div className="mb-6">
              {isGoogleLoading ? (
                <div className="flex items-center justify-center w-full border rounded-xl shadow-sm px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none transition-colors">
                  <LoaderCircle className="animate-spin" size={20} />
                </div>
              ) : (
                <div className="relative">
                  <div ref={googleButtonRef} className="flex absolute justify-center opacity-0" >   </div>
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    className="flex items-center justify-center w-full border rounded-xl shadow-sm px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <svg className="h-5 w-5 mr-2" width="34px" height="34px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path>
                        <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path>
                        <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path>
                        <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path>
                      </g>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>



              )}
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F8F8F8] px-2 text-slate-400">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                  <a href="/forgot-password" title="Forgot password" className="text-xs font-semibold text-slate-400 hover:text-[#6366f1] transition-colors">
                    Forgot password?
                  </a>
                </div>
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
                className="w-full py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold rounded-lg transition-all shadow-sm shadow-[#6366f1]/20"
                disabled={isLoading}
              >
                {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : "Sign in"}
              </Button>

              <p className="text-sm text-center text-slate-500 font-medium pt-4">
                Don't have an account?{" "}
                <a href="/signup" className="text-slate-900 border-b border-slate-300 pb-0.5 font-bold hover:border-slate-900 transition-all">Sign up</a>
              </p>
            </form>
          </div>

          <div className="">
            <p className="text-[10px] leading-relaxed text-slate-400 max-w-sm mx-auto text-center">
              By continuing, you agree to LeadSpotter's <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a> and <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>, and to receive periodic emails with updates.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden z-0 md:flex bg-transparent flex-col bg-white border-l border-slate-100 p-12 lg:p-20 justify-center relative overflow-hidden">
        <QuoteCarousel pagetype="login" />
      </div>
    </div>
  )
}
