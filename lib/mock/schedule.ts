import type { Skill } from "@/lib/mock/staff"

export type ScheduleShift = {
  id: string
  day: number
  start: string
  end: string
  role: Skill
  assignee?: string
  needed: number
  filled: number
  premium?: boolean
}

export const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export const scheduleByLocation: Record<string, ScheduleShift[]> = {
  harbor: [
    { id: "h1", day: 0, start: "11:00", end: "19:00", role: "Line cook", assignee: "Noah Kim", needed: 1, filled: 1 },
    { id: "h2", day: 0, start: "16:00", end: "23:00", role: "Bartender", assignee: "Sofia Alvarez", needed: 1, filled: 1 },
    { id: "h3", day: 1, start: "11:00", end: "19:00", role: "Line cook", assignee: "Liam Walsh", needed: 1, filled: 1 },
    { id: "h4", day: 1, start: "17:00", end: "23:00", role: "Server", assignee: "Maria Santos", needed: 2, filled: 1 },
    { id: "h5", day: 2, start: "11:00", end: "19:00", role: "Line cook", assignee: "Noah Kim", needed: 1, filled: 1 },
    { id: "h6", day: 2, start: "16:00", end: "22:00", role: "Bartender", assignee: "Sofia Alvarez", needed: 1, filled: 1 },
    { id: "h7", day: 3, start: "16:00", end: "23:00", role: "Server", assignee: "Priya Shah", needed: 1, filled: 1 },
    { id: "h8", day: 3, start: "17:00", end: "23:00", role: "Host", needed: 1, filled: 0 },
    { id: "h9", day: 4, start: "16:00", end: "23:00", role: "Bartender", assignee: "Sofia Alvarez", needed: 1, filled: 1, premium: true },
    { id: "h10", day: 4, start: "17:00", end: "01:00", role: "Server", assignee: "Priya Shah", needed: 2, filled: 1, premium: true },
    { id: "h11", day: 4, start: "17:00", end: "01:00", role: "Line cook", assignee: "Noah Kim", needed: 1, filled: 1, premium: true },
    { id: "h12", day: 5, start: "16:00", end: "23:00", role: "Bartender", needed: 1, filled: 0, premium: true },
    { id: "h13", day: 5, start: "17:00", end: "01:00", role: "Server", assignee: "Maria Santos", needed: 2, filled: 1, premium: true },
    { id: "h14", day: 6, start: "11:00", end: "17:00", role: "Server", assignee: "Sofia Alvarez", needed: 1, filled: 1 },
    { id: "h15", day: 6, start: "11:00", end: "19:00", role: "Line cook", assignee: "Liam Walsh", needed: 1, filled: 1 },
  ],
  pier: [
    { id: "p1", day: 0, start: "10:00", end: "18:00", role: "Line cook", assignee: "Diego Romero", needed: 1, filled: 1 },
    { id: "p2", day: 2, start: "16:00", end: "22:00", role: "Server", assignee: "Priya Shah", needed: 1, filled: 1 },
    { id: "p3", day: 4, start: "17:00", end: "23:00", role: "Server", assignee: "Priya Shah", needed: 2, filled: 1, premium: true },
    { id: "p4", day: 5, start: "17:00", end: "23:00", role: "Server", needed: 2, filled: 0, premium: true },
    { id: "p5", day: 5, start: "16:00", end: "22:00", role: "Host", assignee: "Maria Santos", needed: 1, filled: 1, premium: true },
    { id: "p6", day: 6, start: "10:00", end: "16:00", role: "Dishwasher", assignee: "Diego Romero", needed: 1, filled: 1 },
  ],
  lighthouse: [
    { id: "l1", day: 1, start: "16:00", end: "23:00", role: "Bartender", assignee: "James O'Brien", needed: 1, filled: 1 },
    { id: "l2", day: 3, start: "16:00", end: "22:00", role: "Host", assignee: "Aisha Patel", needed: 1, filled: 1 },
    { id: "l3", day: 4, start: "17:00", end: "01:00", role: "Bartender", assignee: "James O'Brien", needed: 1, filled: 1, premium: true },
    { id: "l4", day: 5, start: "17:00", end: "01:00", role: "Server", assignee: "Chloe Nguyen", needed: 2, filled: 1, premium: true },
    { id: "l5", day: 5, start: "16:00", end: "23:00", role: "Host", needed: 1, filled: 0, premium: true },
  ],
  tidewater: [
    { id: "t1", day: 2, start: "17:00", end: "23:00", role: "Host", assignee: "Emma Carter", needed: 1, filled: 1 },
    { id: "t2", day: 4, start: "18:00", end: "00:00", role: "Server", assignee: "Chloe Nguyen", needed: 2, filled: 1, premium: true },
    { id: "t3", day: 5, start: "18:00", end: "00:00", role: "Server", needed: 2, filled: 0, premium: true },
    { id: "t4", day: 5, start: "17:00", end: "23:00", role: "Shift lead", assignee: "Emma Carter", needed: 1, filled: 1, premium: true },
  ],
}
