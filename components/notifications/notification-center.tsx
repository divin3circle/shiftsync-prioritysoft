"use client"

import * as React from "react"
import { toast } from "sonner"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { demoNotifications, type DemoNotification } from "@/lib/mock/notifications"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"

function NotificationList({
  items,
  onRead,
}: {
  items: DemoNotification[]
  onRead: (id: string) => void
}) {
  return (
    <ul className="flex flex-col overflow-hidden rounded-xl border">
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onRead(item.id)}
          className={cn(
            "flex cursor-pointer gap-3 border-b p-4 last:border-b-0",
            item.unread && "bg-muted/40",
          )}
        >
          <span
            className={cn(
              "mt-1.5 size-2 shrink-0 rounded-full",
              item.unread ? "bg-foreground" : "bg-border",
            )}
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-muted-foreground text-xs">{item.time}</span>
            </div>
            <span className="text-muted-foreground text-sm">{item.body}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function NotificationCenter() {
  const [items, setItems] = React.useState<DemoNotification[]>(demoNotifications)
  const unreadCount = items.filter((item) => item.unread).length

  function markRead(id: string) {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }

  function markAllRead() {
    setItems((previous) => previous.map((item) => ({ ...item, unread: false })))
    toast.success("All caught up")
  }

  return (
    <Tabs defaultValue="all" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all read
        </Button>
      </div>

      <TabsContent value="all">
        <NotificationList items={items} onRead={markRead} />
      </TabsContent>

      <TabsContent value="unread">
        {unreadCount > 0 ? (
          <NotificationList items={items.filter((item) => item.unread)} onRead={markRead} />
        ) : (
          <EmptyState icon={CheckmarkCircle02Icon} title="You are all caught up" />
        )}
      </TabsContent>
    </Tabs>
  )
}
