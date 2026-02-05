"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChatCircle, Sparkle } from "phosphor-react"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { AppSidebar } from "@/components/AppSidebar"
import { AppPage } from "@/components/AppPage"

const PLANS = [
  {
    name: "Free",
    id: "free",
    price: "₹0",
    description: "Perfect for testing and small projects.",
    limit: 500,
    features: [
      "Up to 500 leads extraction",
      "Localized search by area",
      "Basic email extraction",
      "Standard support",
    ],
    buttonText: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    id: "pro",
    price: "₹2,000",
    period: "/month",
    description: "For professionals needing more volume.",
    limit: 5000,
    features: [
      "Up to 5,000 leads extraction",
      "Priority area caching",
      "Advanced social enrichment",
      "Bulk export history",
      "Priority email support",
    ],
    buttonText: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Premium",
    id: "premium",
    price: "Custom",
    description: "Scale without limits for your entire team.",
    limit: Infinity,
    features: [
      "Unlimited leads extraction",
      "Full API access",
      "Dedicated account manager",
      "Custom integration support",
      "White-glove data cleaning",
    ],
    buttonText: "Contact Sales",
    whatsapp: true,
  },
]

import { useAutomation } from "@/context/AutomationContext"

export default function SubscriptionPage() {
  const { user, isLoadingUser: isLoading } = useAutomation()

  const handleUpgrade = (plan: any) => {
    if (plan.whatsapp) {
      window.open("https://wa.me/919773005701?text=Hi, I am interested in the Premium plan for Lead Extractor.", "_blank")
    } else if (plan.id === "pro") {
      // In a real app, redirect to Stripe/Razorpay
      alert("Redirecting to payment gateway for Pro Plan (₹2,000)...")
    }
  }

  

  const currentPlan = PLANS.find(p => p.id === (user?.plan_type || "free"))
  const usedLeads = user?.leads_extracted || 0
  const baseLimit = currentPlan?.limit || 500
  const bonusCredits = user?.bonus_credits || 0
  const limit = baseLimit === Infinity ? Infinity : baseLimit + bonusCredits
  const remaining = limit === Infinity ? Infinity : Math.max(limit - usedLeads, 0)
  const usagePercent = limit === Infinity ? 0 : Math.min((usedLeads / limit) * 100, 100)

  return (
    <>

      <AppSidebar />
      <AppPage
        title="Subscription & Plans"
        description="Choose the right plan to scale your lead generation."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Subscription & Plans" }]}
      >
        {isLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">
            {user && (
              <Card className="border-border/60 bg-muted/20">
                <CardContent className="py-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current usage</p>
                      <h3 className="text-2xl font-semibold">
                        {usedLeads.toLocaleString()} / {limit === Infinity ? "Unlimited" : limit.toLocaleString()} leads
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Plan: <span className="font-semibold capitalize text-foreground">{user.plan_type}</span>
                      </p>
                    </div>
                    <div className="flex-1 max-w-md w-full">
                      <Progress value={usagePercent} className="h-3" />
                      <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground">
                        <span>{Math.round(usagePercent)}% used</span>
                        <span>
                          {limit === Infinity ? "No limit" : `${remaining.toLocaleString()} available`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => {
                const isCurrent = user?.plan_type === plan.id
                
                return (
                  <Card 
                    key={plan.name} 
                    className={cn(
                      "relative flex flex-col border-border/60 transition-all duration-300",
                      plan.highlight ? "bg-primary/5 shadow-lg" : "bg-background",
                      isCurrent && "ring-1 ring-primary"
                    )}
                  >
                    {plan.highlight && (
                      <div className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkle className="h-3 w-3" />
                        Most popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="min-h-[44px]">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="mb-6">
                        <span className="text-4xl font-semibold">{plan.price}</span>
                        {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-sm">
                            <div className="mt-1 rounded-full bg-primary/10 p-0.5 text-primary">
                              <Check className="h-3 w-3" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full h-11" 
                        variant={plan.highlight ? "default" : "outline"}
                        disabled={isCurrent || plan.disabled}
                        onClick={() => handleUpgrade(plan)}
                      >
                        {isCurrent ? "Current Plan" : (
                          plan.whatsapp ? (
                            <>
                              <ChatCircle className="mr-2 h-4 w-4" />
                              {plan.buttonText}
                            </>
                          ) : (
                            plan.buttonText
                          )
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              <p>All plans include access to the localized area database and 24/7 technical support.</p>
              <p className="mt-2">
                Need a custom enterprise solution?{" "}
                <a href="#" className="underline underline-offset-4 text-foreground">Let&apos;s talk.</a>
              </p>
            </div>
          </div>
        )}
      </AppPage>
    </>
  )
}
