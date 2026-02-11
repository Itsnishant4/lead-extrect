"use client"

import * as React from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

type Crumb = {
  label: string
  href?: string
}

type AppPageProps = {
  title: string
  description?: string
  breadcrumb?: Crumb[]
  actions?: React.ReactNode
  children: React.ReactNode
}

export function AppPage({
  title,
  description,
  breadcrumb = [],
  actions,
  children,
}: AppPageProps) {
  const { open, setOpen } = useSidebar();
  return (
    <SidebarInset>
      <header className={`sticky ${open ? 'ml-[250px]' : 'md:ml-[60px] '} transition-all ease-in-out duration-300 top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {breadcrumb.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((crumb, index) => (
                  <React.Fragment key={`${crumb.label}-${index}`}>
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumb.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </header>

      <main className={`flex-1 transition-all ease-in-out duration-300 ${open ? 'ml-[250px]' : 'md:ml-[50px]'}`}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-6 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-10 top-24 h-56 w-56 rounded-full bg-muted/40 blur-3xl" />
          </div>
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12 pt-8 md:px-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
              {description && (
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  {description}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </main>
    </SidebarInset>
  )
}
