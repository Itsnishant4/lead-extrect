"use client"

import { useState } from "react"
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
import { signupAction } from "@/app/actions"
import { toast } from "sonner"
import { Eye, EyeSlash, Rocket, ShieldCheck, Users } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-border/60">
        <CardContent className="grid p-0 md:grid-cols-[1.05fr_0.95fr]">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Rocket className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-semibold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Join us to start your localized lead extraction journey
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldDescription>
                  Minimum 8 characters for security.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-4">
                Already member?
              </FieldSeparator>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4 font-semibold text-primary">
                  Sign in
                </a>
              </div>
            </FieldGroup>
          </form>
          <div className="hidden md:flex flex-col justify-between gap-6 border-l border-border/60 bg-muted/20 p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Built for growth</p>
              <h2 className="text-2xl font-semibold">Launch campaigns faster</h2>
              <p className="text-sm text-muted-foreground">
                Use keyword automation and smart exports to scale your outreach.
              </p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <Users size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">Collaborative workflows</p>
                  <p className="text-muted-foreground text-[11px] sm:text-xs">Track progress and exports in one place.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">Trusted security</p>
                  <p className="text-muted-foreground text-[11px] sm:text-xs">Your lead data stays private and protected.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
