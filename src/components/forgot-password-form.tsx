"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestOTPAction, verifyOTPAction, resetPasswordAction } from "@/app/actions"
import { toast } from "sonner"
import { Eye, EyeSlash, Key, EnvelopeSimple, ShieldCheck } from "phosphor-react"
import { LoaderCircle, ArrowLeft, CheckCircle2 } from "lucide-react"

type Step = "email" | "otp" | "reset" | "success"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const startCooldown = () => {
    setCooldown(60)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await requestOTPAction(email)
      if (result.success) {
        toast.success("OTP sent to your email")
        setStep("otp")
        startCooldown()
      } else {
        toast.error((result as any).error || "Failed to send OTP")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (cooldown > 0) return
    setIsLoading(true)

    try {
      const result = await requestOTPAction(email)
      if (result.success) {
        toast.success("New OTP sent to your email")
        setOtp(["", "", "", "", "", ""])
        startCooldown()
      } else {
        toast.error((result as any).error || "Failed to resend OTP")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("")
      const newOtp = [...otp]
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyOTPAction(email, otpString)
      if (result.success) {
        toast.success("OTP verified successfully")
        setStep("reset")
      } else {
        toast.error((result as any).error || "Invalid OTP")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const otpString = otp.join("")
      const result = await resetPasswordAction(email, otpString, password)
      if (result.success) {
        toast.success("Password reset successfully")
        setStep("success")
      } else {
        toast.error((result as any).error || "Failed to reset password")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-border/60">
        <CardContent className="grid p-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Key className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-semibold">
                  {step === "email" && "Forgot Password"}
                  {step === "otp" && "Enter OTP"}
                  {step === "reset" && "New Password"}
                  {step === "success" && "Password Reset"}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {step === "email" && "Enter your email to receive a 6-digit OTP"}
                  {step === "otp" && `We sent a code to ${email}`}
                  {step === "reset" && "Choose a strong new password for your account"}
                  {step === "success" && "Your password has been reset successfully"}
                </p>
              </div>

              {step === "email" && (
                <form onSubmit={handleRequestOTP}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOTP}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Verification Code</FieldLabel>
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                          <Input
                            key={index}
                            ref={(el) => { otpRefs.current[index] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={(e) => {
                              e.preventDefault()
                              const pasted = e.clipboardData.getData("text")
                              handleOtpChange(index, pasted)
                            }}
                            disabled={isLoading}
                            className="h-12 w-12 text-center text-lg font-semibold"
                          />
                        ))}
                      </div>
                      <FieldDescription>
                        OTP expires in 10 minutes.{" "}
                        {cooldown > 0 ? (
                          <span className="text-muted-foreground">Resend in {cooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                          >
                            Resend OTP
                          </button>
                        )}
                      </FieldDescription>
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </Field>
                    <Field>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setStep("email")
                          setOtp(["", "", "", "", "", ""])
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Change email
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {step === "reset" && (
                <form onSubmit={handleResetPassword}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-new-password">Confirm Password</FieldLabel>
                      <div className="relative">
                        <Input
                          id="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                          {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldDescription>Minimum 8 characters for security.</FieldDescription>
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    You can now log in with your new password.
                  </p>
                  <Button className="w-full" onClick={() => router.push("/login")}>
                    Back to Login
                  </Button>
                </div>
              )}

              {step !== "success" && (
                <>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-4">
                    Remember your password?
                  </FieldSeparator>
                  <div className="text-center text-sm">
                    Go back to{" "}
                    <a href="/login" className="underline underline-offset-4 font-semibold text-primary">
                      Sign in
                    </a>
                  </div>
                </>
              )}
            </FieldGroup>
          </div>
          <div className="hidden md:flex flex-col justify-between gap-6 border-l border-border/60 bg-muted/20 p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account recovery</p>
              <h2 className="text-2xl font-semibold">Secure password reset</h2>
              <p className="text-sm text-muted-foreground">
                Reset your password securely with a one-time verification code.
              </p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <EnvelopeSimple className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email verification</p>
                  <p className="text-muted-foreground">A 6-digit OTP is sent to your registered email.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Secure & time-limited</p>
                  <p className="text-muted-foreground">OTP expires in 10 minutes for your safety.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
