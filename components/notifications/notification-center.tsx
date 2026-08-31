"use client"

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { useSession } from "@/components/role-provider"
import { useNotifications } from "@/hooks/use-notifications"
import type { NotificationItem } from "@/lib/notification-item"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"

function NotificationList({
  items,
  onRead,
}: {
  items: NotificationItem[]
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
            !item.read && "bg-muted/40",
          )}
        >
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
        </li>
      ))}
    </ul>
  )
}

export function NotificationCenter({ initial }: { initial: NotificationItem[] }) {
  const { id } = useSession()
  const { items, unreadCount, markRead, markAllRead } = useNotifications(id, initial)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckmarkCircle02Icon}
        title="No notifications yet"
        description="Updates about your shifts and requests will show up here."
      />
    )
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
          <NotificationList items={items.filter((item) => !item.read)} onRead={markRead} />
        ) : (
          <EmptyState icon={CheckmarkCircle02Icon} title="You are all caught up" />
        )}
      </TabsContent>
    </Tabs>
  )
}
