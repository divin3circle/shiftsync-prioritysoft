export const skills = [
  "Bartender",
  "Line cook",
  "Server",
  "Host",
  "Dishwasher",
  "Shift lead",
] as const

export type Skill = (typeof skills)[number]

export type DemoStaff = {
  id: string
  name: string
  initials: string
  skills: Skill[]
  locationIds: string[]
  desiredHours: number
  homeTimezone: string
}

export const demoStaff: DemoStaff[] = [
  {
    id: "sofia",
    name: "Sofia Alvarez",
    initials: "SA",
    skills: ["Bartender", "Server"],
    locationIds: ["harbor", "pier"],
    desiredHours: 32,
    homeTimezone: "America/Los_Angeles",
  },
  {
    id: "noah",
    name: "Noah Kim",
    initials: "NK",
    skills: ["Line cook", "Shift lead"],
    locationIds: ["harbor"],
    desiredHours: 40,
    homeTimezone: "America/Los_Angeles",
  },
  {
    id: "maria",
    name: "Maria Santos",
    initials: "MS",
    skills: ["Server", "Host"],
    locationIds: ["harbor", "pier"],
    desiredHours: 24,
    homeTimezone: "America/Los_Angeles",
  },
  {
    id: "james",
    name: "James O'Brien",
    initials: "JO",
    skills: ["Bartender", "Shift lead"],
    locationIds: ["lighthouse", "tidewater"],
    desiredHours: 38,
    homeTimezone: "America/New_York",
  },
  {
    id: "aisha",
    name: "Aisha Patel",
    initials: "AP",
    skills: ["Host", "Server"],
    locationIds: ["lighthouse"],
    desiredHours: 20,
    homeTimezone: "America/New_York",
  },
  {
    id: "diego",
    name: "Diego Romero",
    initials: "DR",
    skills: ["Line cook", "Dishwasher"],
    locationIds: ["pier"],
    desiredHours: 36,
    homeTimezone: "America/Los_Angeles",
  },
  {
    id: "chloe",
    name: "Chloe Nguyen",
    initials: "CN",
    skills: ["Server", "Bartender"],
    locationIds: ["tidewater", "lighthouse"],
    desiredHours: 30,
    homeTimezone: "America/New_York",
  },
  {
    id: "liam",
    name: "Liam Walsh",
    initials: "LW",
    skills: ["Dishwasher", "Line cook"],
    locationIds: ["harbor"],
    desiredHours: 28,
    homeTimezone: "America/Los_Angeles",
  },
  {
    id: "emma",
    name: "Emma Carter",
    initials: "EC",
    skills: ["Host", "Shift lead"],
    locationIds: ["tidewater"],
    desiredHours: 34,
    homeTimezone: "America/New_York",
  },
  {
    id: "priya",
    name: "Priya Shah",
    initials: "PS",
    skills: ["Server", "Bartender", "Host"],
    locationIds: ["pier", "harbor"],
    desiredHours: 40,
    homeTimezone: "America/Los_Angeles",
  },
]
