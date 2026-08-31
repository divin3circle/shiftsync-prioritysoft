import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

export type LocationSummary = {
  id: string
  name: string
  timezone: string
  tzLabel: string
}

export type BoardAssignee = { id: string; name: string }

export type BoardShift = {
  id: string
  dayIndex: number
  startMs: number
  startLabel: string
  endLabel: string
  requiredSkill: string
  headcount: number
  premium: boolean
  published: boolean
  assignees: BoardAssignee[]
  isOpen: boolean
}

export type BoardDay = {
  dayIndex: number
  label: string
  dateNumber: number
  shifts: BoardShift[]
}

export type WeekBoard = {
  rangeLabel: string
  published: boolean
  days: BoardDay[]
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const tzLabels: Record<string, string> = {
  "America/Los_Angeles": "PT",
  "America/New_York": "ET",
}

export function tzLabelFor(timezone: string) {
  return tzLabels[timezone] ?? timezone
}

function pickName(value: unknown): string {
  const row = Array.isArray(value) ? value[0] : value
  return (row as { name?: string; full_name?: string } | null)?.name ?? ""
}

export function weekBounds(timezone: string, offset: number) {
  const start = DateTime.now().setZone(timezone).startOf("week").plus({ weeks: offset })
  const end = start.plus({ days: 7 })
  return { start, end }
}

export async function getLocations(supabase: SupabaseClient): Promise<LocationSummary[]> {
  const { data } = await supabase.from("locations").select("id, name, timezone").order("name")
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    timezone: row.timezone,
    tzLabel: tzLabelFor(row.timezone),
  }))
}

function toBoardShift(row: Record<string, unknown>, timezone: string): BoardShift {
  const start = DateTime.fromISO(row.starts_at as string, { zone: "utc" }).setZone(timezone)
  const end = DateTime.fromISO(row.ends_at as string, { zone: "utc" }).setZone(timezone)

  const assignments = (row.assignments as { status: string; staff: unknown }[] | null) ?? []
  const assignees = assignments
    .filter((assignment) => assignment.status === "active")
    .map((assignment) => {
      const staff = Array.isArray(assignment.staff) ? assignment.staff[0] : assignment.staff
      const person = staff as { id: string; full_name: string }
      return { id: person.id, name: person.full_name }
    })

  const headcount = row.headcount as number

  return {
    id: row.id as string,
    dayIndex: start.weekday - 1,
    startMs: start.toMillis(),
    startLabel: start.toFormat("h:mm a"),
    endLabel: end.toFormat("h:mm a"),
    requiredSkill: pickName(row.skills),
    headcount,
    premium: row.is_premium as boolean,
    published: row.published as boolean,
    assignees,
    isOpen: assignees.length < headcount,
  }
}

export async function getWeekBoard(
  supabase: SupabaseClient,
  location: LocationSummary,
  offset: number,
): Promise<WeekBoard> {
  const { start, end } = weekBounds(location.timezone, offset)

  const { data } = await supabase
    .from("shifts")
    .select(
      "id, starts_at, ends_at, headcount, is_premium, published, skills(name), assignments(status, staff:profiles!assignments_staff_id_fkey(id, full_name))",
    )
    .eq("location_id", location.id)
    .gte("starts_at", start.toUTC().toISO())
    .lt("starts_at", end.toUTC().toISO())

  const shifts = (data ?? []).map((row) => toBoardShift(row, location.timezone))

  const days: BoardDay[] = dayNames.map((label, dayIndex) => ({
    dayIndex,
    label,
    dateNumber: start.plus({ days: dayIndex }).day,
    shifts: shifts.filter((shift) => shift.dayIndex === dayIndex).sort((a, b) => a.startMs - b.startMs),
  }))

  return {
    rangeLabel: `${start.toFormat("MMM d")} - ${end.minus({ days: 1 }).toFormat("MMM d")}`,
    published: shifts.length > 0 && shifts.every((shift) => shift.published),
    days,
  }
}
