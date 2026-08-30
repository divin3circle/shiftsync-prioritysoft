export type AuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  target: string
  change: string
}

export const auditEntries: AuditEntry[] = [
  {
    id: "au1",
    time: "Today, 2:14p",
    actor: "Marcus Lee",
    action: "Published schedule",
    target: "Week of Sep 1, Harbor Grill",
    change: "Draft to Published",
  },
  {
    id: "au2",
    time: "Today, 1:52p",
    actor: "Marcus Lee",
    action: "Assigned shift",
    target: "Fri 4:00p Bartender, Harbor Grill",
    change: "Unfilled to Sofia Alvarez",
  },
  {
    id: "au3",
    time: "Today, 11:07a",
    actor: "Dana Whitfield",
    action: "Edited shift",
    target: "Sat 5:00p Server, Pier Seven",
    change: "Headcount 1 to 2",
  },
  {
    id: "au4",
    time: "Yesterday, 6:40p",
    actor: "Marcus Lee",
    action: "Approved override",
    target: "Priya Shah, seventh consecutive day",
    change: "Reason: holiday weekend coverage",
  },
  {
    id: "au5",
    time: "Yesterday, 4:03p",
    actor: "System",
    action: "Cancelled swap",
    target: "Sofia Alvarez and Maria Santos, Fri dinner",
    change: "Pending to Cancelled (shift edited)",
  },
  {
    id: "au6",
    time: "Yesterday, 9:22a",
    actor: "Marcus Lee",
    action: "Unpublished schedule",
    target: "Week of Aug 25, Lighthouse",
    change: "Published to Draft",
  },
]
