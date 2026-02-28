"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserAction } from "@/app/actions"
import { LoaderCircle } from "lucide-react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
      async function checkAdmin() {
        const res = await getUserAction()
        if (res.success && (res.data as any)?.isAdmin) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          router.push("/")
        }
      }

    checkAdmin()
  }, [router])

 

  if (isAdmin === false) return null

  return (
    <>
      {isAdmin === null ? (
        <div className="flex h-screen w-screen items-center justify-center bg-background fixed inset-0 z-50">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <AdminSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </>
      )}
    </>
  )
}
