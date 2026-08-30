export type DemoNotification = {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
}

export const demoNotifications: DemoNotification[] = [
  {
    id: "n1",
    title: "Schedule published",
    body: "Harbor location, week of Sep 1 is now live.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Swap needs approval",
    body: "Sofia Alvarez wants to swap Fri dinner with Noah Kim.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Overtime warning",
    body: "Noah Kim is projected at 38 hours this week.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "n4",
    title: "Availability updated",
    body: "Maria Santos changed her Tuesday window.",
    time: "Yesterday",
    unread: false,
  },
]
