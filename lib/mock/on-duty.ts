export type OnDutyEntry = {
  name: string
  initials: string
  role: string
  since: string
  until: string
}

export const onDutyByLocation: Record<string, OnDutyEntry[]> = {
  harbor: [
    { name: "Noah Kim", initials: "NK", role: "Line cook", since: "11:00a", until: "7:00p" },
    { name: "Liam Walsh", initials: "LW", role: "Dishwasher", since: "11:00a", until: "7:00p" },
  ],
  pier: [
    { name: "Diego Romero", initials: "DR", role: "Line cook", since: "10:00a", until: "6:00p" },
  ],
  lighthouse: [
    { name: "James O'Brien", initials: "JO", role: "Bartender", since: "5:00p", until: "1:00a" },
    { name: "Aisha Patel", initials: "AP", role: "Host", since: "4:00p", until: "10:00p" },
  ],
  tidewater: [
    { name: "Emma Carter", initials: "EC", role: "Host", since: "5:00p", until: "11:00p" },
  ],
}
