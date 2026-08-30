export type SchedulingStatus = "under" | "on_target" | "over"

export type FairnessRow = {
  name: string
  premiumShifts: number
  scheduling: SchedulingStatus
}

export const fairnessRows: FairnessRow[] = [
  { name: "Priya Shah", premiumShifts: 7, scheduling: "over" },
  { name: "Sofia Alvarez", premiumShifts: 5, scheduling: "over" },
  { name: "James O'Brien", premiumShifts: 5, scheduling: "on_target" },
  { name: "Chloe Nguyen", premiumShifts: 4, scheduling: "on_target" },
  { name: "Maria Santos", premiumShifts: 3, scheduling: "on_target" },
  { name: "Noah Kim", premiumShifts: 3, scheduling: "over" },
  { name: "Diego Romero", premiumShifts: 2, scheduling: "on_target" },
  { name: "Emma Carter", premiumShifts: 2, scheduling: "under" },
  { name: "Liam Walsh", premiumShifts: 1, scheduling: "under" },
  { name: "Aisha Patel", premiumShifts: 0, scheduling: "under" },
]

export const fairnessSummary = {
  score: "Uneven",
  detail:
    "Premium Friday and Saturday evening shifts cluster around a few people. Aisha Patel has had none in this period.",
  period: "Last 4 weeks",
}
