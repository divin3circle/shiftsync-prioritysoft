"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification03Icon } from "@hugeicons/core-free-icons"

import { demoNotifications } from "@/lib/mock/notifications"
import { Button } from "@/components/ui/button"
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

export function NotificationsButton() {
  const unread = demoNotifications.filter((item) => item.unread).length

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <HugeiconsIcon icon={Notification03Icon} />
            {unread > 0 ? (
              <span className="bg-foreground text-background absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                {unread}
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
            {demoNotifications.map((item) => (
              <div key={item.id} className="border-border/60 flex gap-3 border-b px-4 py-3">
                <span
                  className={
                    item.unread
                      ? "bg-foreground mt-1.5 size-2 shrink-0 rounded-full"
                      : "bg-border mt-1.5 size-2 shrink-0 rounded-full"
                  }
                />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-muted-foreground text-xs">{item.time}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">{item.body}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>
          <Button variant="outline" render={<Link href="/notifications" />}>
            View all
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
