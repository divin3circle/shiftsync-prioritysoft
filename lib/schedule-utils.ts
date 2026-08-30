import { scheduleByLocation, type ScheduleShift } from "@/lib/mock/schedule"

export type AssignedShift = ScheduleShift & { locationId: string }

export function shiftHours(start: string, end: string): number {
  const [startHour, startMinute] = start.split(":").map(Number)
  const [endHour, endMinute] = end.split(":").map(Number)
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
  if (minutes <= 0) {
    minutes += 24 * 60
  }
  return minutes / 60
}

export function weeklyHoursByName(name: string): number {
  return Object.values(scheduleByLocation)
    .flat()
    .filter((shift) => shift.assignee === name)
    .reduce((total, shift) => total + shiftHours(shift.start, shift.end), 0)
}

export function shiftsForName(name: string): AssignedShift[] {
  const rows: AssignedShift[] = []
  for (const [locationId, shifts] of Object.entries(scheduleByLocation)) {
    for (const shift of shifts) {
      if (shift.assignee === name) {
        rows.push({ ...shift, locationId })
      }
    }
  }
  return rows.sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
}
