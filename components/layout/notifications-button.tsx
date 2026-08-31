"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Notification03Icon } from "@hugeicons/core-free-icons"

import { useSession } from "@/components/role-provider"
import { useNotifications } from "@/hooks/use-notifications"
import type { NotificationItem } from "@/lib/notification-item"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/common/link-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function NotificationsButton({ initial }: { initial: NotificationItem[] }) {
  const { id } = useSession()
  const { items, unreadCount, markAllRead } = useNotifications(id, initial)

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <HugeiconsIcon icon={Notification03Icon} />
            {unreadCount > 0 ? (
              <span className="bg-foreground text-background absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                {unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Recent activity across your locations.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {items.length === 0 ? (
              <p className="text-muted-foreground p-4 text-sm">Nothing new right now.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="border-border/60 flex gap-3 border-b px-4 py-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      item.read ? "bg-border" : "bg-foreground",
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-muted-foreground text-xs">{item.timeLabel}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">{item.body}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="flex-row justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
          <LinkButton href="/notifications" variant="outline">
            View all
          </LinkButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
