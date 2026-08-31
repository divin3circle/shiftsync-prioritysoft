import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/auth"
import { RoleProvider } from "@/components/role-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  return (
    <RoleProvider user={user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProvider>
  )
}
