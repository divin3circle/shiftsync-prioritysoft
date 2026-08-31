import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { mapNotification, type NotificationItem } from "@/lib/notification-item"

// Initial data comes from the server; this hook keeps it live. Row level
// security scopes the realtime stream to the user, so the filter is a
// narrowing convenience rather than the security boundary.
export function useNotifications(userId: string, initial: NotificationItem[]) {
  const [items, setItems] = React.useState(initial)
  const supabase = React.useMemo(() => createClient(), [])

  const refresh = React.useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    setItems((data ?? []).map(mapNotification))
  }, [supabase, userId])

  React.useEffect(() => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => refresh(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, refresh])

  const markRead = React.useCallback(
    async (id: string) => {
      setItems((previous) => previous.map((item) => (item.id === id ? { ...item, read: true } : item)))
      await supabase.from("notifications").update({ read: true }).eq("id", id)
    },
    [supabase],
  )

  const markAllRead = React.useCallback(async () => {
    setItems((previous) => previous.map((item) => ({ ...item, read: true })))
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)
  }, [supabase, userId])

  return {
    items,
    unreadCount: items.filter((item) => !item.read).length,
    markRead,
    markAllRead,
  }
}
