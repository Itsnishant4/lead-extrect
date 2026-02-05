"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { 
  User, 
  Envelope, 
  Shield, 
  CreditCard, 
  Activity, 
  Calendar,
  ArrowRight,
  ShieldCheck
} from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

import { AppSidebar } from "@/components/AppSidebar"
import { AppPage } from "@/components/AppPage"

import { useAutomation } from "@/context/AutomationContext"

export default function ProfilePage() {
  const { user, isLoadingUser: isLoading } = useAutomation()

 

  const limits: Record<string, number> = {
    'free': 500,
    'pro': 5000,
    'premium': Infinity
  }

  const baseLimit = limits[user?.plan_type || 'free']
  const bonusCredits = (user as any)?.bonus_credits || 0
  const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonusCredits
  const usagePercent = currentLimit === Infinity ? 0 : Math.min(((user?.leads_extracted || 0) / currentLimit) * 100, 100)
  const planBadgeVariant = user?.plan_type === 'premium' ? 'default' : user?.plan_type === 'pro' ? 'secondary' : 'outline'

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Profile & Account"
        description="Manage your account details and subscription usage."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Profile & Account" }]}
      >
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
            <Card className="border-border/60">
              <CardHeader className="items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary">
                  {user?.name?.[0]?.toUpperCase() || <User />}
                </div>
                <div className="mt-4 space-y-1">
                  <CardTitle>{user?.name}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" /> Full name
                  </span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Envelope className="h-4 w-4" /> Email
                  </span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" /> Role
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {user?.is_admin ? "Administrator" : "User"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Joined
                  </span>
                  <span className="font-medium">
                    {user?.created_at ? format(new Date(user.created_at), "MMM dd, yyyy") : "N/A"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Current plan
                      </CardTitle>
                      <CardDescription>Details about your subscription.</CardDescription>
                    </div>
                    <Badge 
                      variant={planBadgeVariant}
                      className="h-8 px-4 text-sm font-bold capitalize"
                    >
                      {user?.plan_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Leads extracted</p>
                        <div className="text-2xl font-semibold text-foreground">
                          {user?.leads_extracted?.toLocaleString()}
                        </div>
                      </div>
                      {bonusCredits > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Bonus credits</p>
                          <div className="text-2xl font-semibold text-primary">
                            +{bonusCredits.toLocaleString()}
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Total limit</p>
                        <div className="text-2xl font-semibold text-foreground">
                          {currentLimit === Infinity ? "Unlimited" : currentLimit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={usagePercent} className="h-3" />
                      <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>{Math.round(usagePercent)}% used</span>
                        <span>
                          {currentLimit === Infinity
                            ? "Unlimited plan"
                            : `${(currentLimit - (user?.leads_extracted || 0)).toLocaleString()} remaining`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user?.subscription_expiry && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                      <Activity className="h-4 w-4" />
                      <span>
                        Subscription expires on <b>{format(new Date(user.subscription_expiry), "MMM dd, yyyy")}</b>
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-border/60 pt-4">
                  <Link href="/subscription" className="w-full">
                    <Button className="w-full group">
                      Change plan
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-border/60 bg-muted/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle>Security & privacy</CardTitle>
                  <CardDescription>Your extraction data is protected by default.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    LeadExtractor Pro encrypts stored leads and keeps access locked to your account only.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </AppPage>
    </>
  )
}
