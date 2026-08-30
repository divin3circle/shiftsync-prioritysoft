export type DashboardStat = {
  label: string
  value: string
  hint: string
  emphasis?: "warning"
}

export type ShiftRow = {
  id: string
  location: string
  when: string
  person?: string
  role: string
  status: "on" | "upcoming" | "open"
}

export type DashboardAlert = {
  id: string
  title: string
  detail: string
  tone: "warning" | "info"
}

export const managerStats: DashboardStat[] = [
  { label: "On duty now", value: "12", hint: "across 4 locations" },
  { label: "Open shifts", value: "5", hint: "unfilled this week" },
  { label: "Pending approvals", value: "3", hint: "swaps and drops" },
  { label: "Projected overtime", value: "6.5h", hint: "about $312 this week", emphasis: "warning" },
]

export const managerToday: ShiftRow[] = [
  {
    id: "m1",
    location: "Harbor Grill",
    when: "11:00a - 7:00p PT",
    person: "Noah Kim",
    role: "Line cook",
    status: "on",
  },
  {
    id: "m2",
    location: "Lighthouse",
    when: "5:00p - 1:00a ET",
    person: "James O'Brien",
    role: "Bartender",
    status: "on",
  },
  {
    id: "m3",
    location: "Harbor Grill",
    when: "4:00p - 11:00p PT",
    person: "Sofia Alvarez",
    role: "Bartender",
    status: "upcoming",
  },
  {
    id: "m4",
    location: "Pier Seven",
    when: "5:00p - 11:00p PT",
    person: "Priya Shah",
    role: "Server",
    status: "upcoming",
  },
  {
    id: "m5",
    location: "Tidewater",
    when: "6:00p - 12:00a ET",
    role: "Server",
    status: "open",
  },
]

export const managerAlerts: DashboardAlert[] = [
  {
    id: "a1",
    title: "Noah Kim nearing overtime",
    detail: "Projected 38 hours this week at Harbor Grill.",
    tone: "warning",
  },
  {
    id: "a2",
    title: "Coverage gap at Tidewater",
    detail: "Saturday 6:00p server shift is unfilled, two days out.",
    tone: "warning",
  },
  {
    id: "a3",
    title: "Seventh consecutive day",
    detail: "Priya Shah would work seven days straight. Override required.",
    tone: "warning",
  },
  {
    id: "a4",
    title: "Swap needs approval",
    detail: "Sofia Alvarez and Maria Santos want to swap Friday dinner.",
    tone: "info",
  },
]

export const staffStats: DashboardStat[] = [
  { label: "Next shift", value: "Fri 4:00p", hint: "Harbor Grill, Bartender" },
  { label: "Hours this week", value: "28 / 40", hint: "4 shifts booked" },
  { label: "Pending requests", value: "1 / 3", hint: "swap awaiting approval" },
  { label: "Open shifts for you", value: "4", hint: "match your skills" },
]

export const staffUpcoming: ShiftRow[] = [
  {
    id: "s1",
    location: "Harbor Grill",
    when: "Fri 4:00p - 11:00p PT",
    role: "Bartender",
    status: "upcoming",
  },
  {
    id: "s2",
    location: "Pier Seven",
    when: "Sat 5:00p - 11:00p PT",
    role: "Server",
    status: "upcoming",
  },
  {
    id: "s3",
    location: "Harbor Grill",
    when: "Sun 11:00a - 5:00p PT",
    role: "Server",
    status: "upcoming",
  },
  {
    id: "s4",
    location: "Harbor Grill",
    when: "Mon 4:00p - 10:00p PT",
    role: "Bartender",
    status: "upcoming",
  },
]

export const staffActivity: DashboardAlert[] = [
  {
    id: "sa1",
    title: "Swap request sent",
    detail: "You asked Maria to take Friday dinner. Awaiting manager approval.",
    tone: "info",
  },
  {
    id: "sa2",
    title: "Schedule published",
    detail: "Week of Sep 1 at Harbor Grill is now live.",
    tone: "info",
  },
  {
    id: "sa3",
    title: "New open shift",
    detail: "Saturday 6:00p server at Pier Seven matches your skills.",
    tone: "info",
  },
]
