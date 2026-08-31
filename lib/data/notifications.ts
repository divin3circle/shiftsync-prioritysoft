import type { SupabaseClient } from "@supabase/supabase-js"

import { mapNotification, type NotificationItem } from "@/lib/notification-item"

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
): Promise<NotificationItem[]> {
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (data ?? []).map(mapNotification)
}
