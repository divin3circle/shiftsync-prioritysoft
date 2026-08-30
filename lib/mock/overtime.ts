export type OvertimeStatus = "ok" | "approaching" | "overtime"

export type OvertimeRow = {
  name: string
  hours: number
  consecutiveDays: number
  status: OvertimeStatus
  note?: string
}

export const overtimeRows: OvertimeRow[] = [
  {
    name: "Noah Kim",
    hours: 44,
    consecutiveDays: 6,
    status: "overtime",
    note: "Friday close pushes him past 40 hours",
  },
  {
    name: "Priya Shah",
    hours: 41,
    consecutiveDays: 7,
    status: "overtime",
    note: "Seventh consecutive day needs a documented override",
  },
  { name: "Diego Romero", hours: 38, consecutiveDays: 5, status: "approaching" },
  { name: "Sofia Alvarez", hours: 36, consecutiveDays: 4, status: "approaching" },
  { name: "Chloe Nguyen", hours: 35, consecutiveDays: 4, status: "approaching" },
  { name: "James O'Brien", hours: 32, consecutiveDays: 4, status: "ok" },
  { name: "Emma Carter", hours: 30, consecutiveDays: 3, status: "ok" },
  { name: "Maria Santos", hours: 28, consecutiveDays: 3, status: "ok" },
  { name: "Liam Walsh", hours: 26, consecutiveDays: 3, status: "ok" },
  { name: "Aisha Patel", hours: 18, consecutiveDays: 2, status: "ok" },
]

export const overtimeStats = {
  projectedCost: "$486",
  overForty: 2,
  approaching: 3,
  overrideNeeded: 1,
}
