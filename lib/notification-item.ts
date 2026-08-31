import { DateTime } from "luxon"

export type NotificationItem = {
  id: string
  title: string
  body: string
  timeLabel: string
  read: boolean
}

type NotificationRow = {
  id: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

export function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? "",
    read: row.read,
    timeLabel: DateTime.fromISO(row.created_at).toFormat("MMM d, h:mm a"),
  }
}
