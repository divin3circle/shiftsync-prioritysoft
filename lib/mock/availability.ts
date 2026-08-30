export type AvailabilityWindow = {
  day: number
  start: string
  end: string
}

export type AvailabilityException = {
  id: string
  date: string
  kind: "unavailable" | "available"
  note: string
}

export const recurringAvailability: AvailabilityWindow[] = [
  { day: 0, start: "16:00", end: "23:00" },
  { day: 2, start: "16:00", end: "23:00" },
  { day: 3, start: "16:00", end: "23:00" },
  { day: 4, start: "16:00", end: "23:59"},
  { day: 5, start: "16:00", end: "23:59"},
  { day: 6, start: "11:00", end: "18:00" },
]

export const availabilityExceptions: AvailabilityException[] = [
  { id: "e1", date: "Sep 6", kind: "unavailable", note: "Family event, all day" },
  { id: "e2", date: "Sep 12", kind: "available", note: "Can cover a morning shift" },
]

export const availabilityTimezone = "Pacific (PT)"
