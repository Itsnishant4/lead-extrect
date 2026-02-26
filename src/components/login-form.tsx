"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/app/actions"
import { toast } from "sonner"
import { Eye, EyeSlash, Sparkle, ShieldCheck, Lightning } from "phosphor-react"
import { LoaderCircle } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await loginAction(email, password)
      if (result.success) {
        toast.success("Logged in successfully")
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-border/60">
        <CardContent className="grid p-0 md:grid-cols-[1.05fr_0.95fr]">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkle className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-semibold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account to start extracting leads
                </p>
              </div>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline text-primary"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-4">
                Connect and Go
              </FieldSeparator>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4 font-semibold text-primary">
                  Sign up
                </a>
              </div>
            </FieldGroup>
          </form>
          <div className="hidden md:flex flex-col justify-between gap-6 border-l border-border/60 bg-muted/20 p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why teams choose us</p>
              <h2 className="text-2xl font-semibold">Faster lead generation</h2>
              <p className="text-sm text-muted-foreground">
                Build, run, and export campaigns with a clean workflow built for speed.
              </p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <Lightning className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Instant results</p>
                  <p className="text-muted-foreground text-xs">Extract leads and export CSV files in seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Secure by default</p>
                  <p className="text-muted-foreground text-xs">Your data stays private and encrypted.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
