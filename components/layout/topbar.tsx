"use client"

import { usePathname } from "next/navigation"

import { findNavTitle } from "@/lib/nav"
import type { NotificationItem } from "@/lib/notification-item"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import { NotificationsButton } from "@/components/layout/notifications-button"

export function Topbar({ notifications }: { notifications: NotificationItem[] }) {
  const pathname = usePathname()
  const title = findNavTitle(pathname) ?? "ShiftSync"

  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <h1 className="text-sm font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-1">
        <NotificationsButton initial={notifications} />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
