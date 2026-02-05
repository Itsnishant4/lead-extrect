"use client";

import Link from "next/link";
import { MagnifyingGlass, List, ArrowRight } from "phosphor-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen w-screen bg-background">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <Card className="w-full max-w-2xl border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <p className="text-xs font-semibold  text-muted-foreground">Quick Start</p>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">Choose Your Workflow</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Pick how you want to extract leads today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex p-2 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                      <MagnifyingGlass className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Find Leads</CardTitle>
                      <CardDescription>Search and export leads from a single query.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full gap-2">
                    <Link href="/leads">
                      Go to Lead Extractor
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex p-2 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                      <List className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Find Bulk Leads</CardTitle>
                      <CardDescription>Generate keyword lists and run bulk extraction.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link href="/keywords">
                      Go to Keyword Generator
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
