import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

import { initials } from "@/lib/initials"

export type RosterShift = {
  id: string
  startMs: number
  dayLabel: string
  timeLabel: string
  location: string
  role: string
}

export type RosterMember = {
  id: string
  name: string
  initials: string
  skills: string[]
  locations: { id: string; name: string; certified: boolean }[]
  desiredHours: number
  weekHours: number
  shifts: RosterShift[]
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value
  return (row as Record<string, unknown>) ?? null
}

function many(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : []
}

export async function getRoster(supabase: SupabaseClient): Promise<RosterMember[]> {
  const start = DateTime.now().setZone("America/New_York").startOf("week")
  const end = DateTime.now().setZone("America/Los_Angeles").startOf("week").plus({ days: 7 })

  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, desired_hours, staff_skills(skills(name)), staff_locations(certified, locations(id, name))",
      )
      .eq("role", "staff")
      .order("full_name"),
    supabase
      .from("assignments")
      .select(
        "staff_id, starts_at, ends_at, shifts(skills(name), locations(name, timezone))",
      )
      .eq("status", "active")
      .gte("starts_at", start.toUTC().toISO())
      .lt("starts_at", end.toUTC().toISO()),
  ])

  const shiftsByStaff = new Map<string, RosterShift[]>()
  const hoursByStaff = new Map<string, number>()
  for (const row of assignments ?? []) {
    const shift = one(row.shifts)
    const location = one(shift?.locations)
    const tz = (location?.timezone as string) ?? "America/Los_Angeles"
    const start = DateTime.fromISO(row.starts_at as string, { zone: "utc" }).setZone(tz)
    const end = DateTime.fromISO(row.ends_at as string, { zone: "utc" }).setZone(tz)
    const staffId = row.staff_id as string
    const entry: RosterShift = {
      id: `${staffId}-${start.toMillis()}`,
      startMs: start.toMillis(),
      dayLabel: start.toFormat("EEE, MMM d"),
      timeLabel: `${start.toFormat("h:mm a")} - ${end.toFormat("h:mm a")}`,
      location: (location?.name as string) ?? "",
      role: (one(shift?.skills)?.name as string) ?? "",
    }
    shiftsByStaff.set(staffId, [...(shiftsByStaff.get(staffId) ?? []), entry])
    hoursByStaff.set(staffId, (hoursByStaff.get(staffId) ?? 0) + end.diff(start, "hours").hours)
  }

  return (profiles ?? []).map((profile) => {
    const shifts = (shiftsByStaff.get(profile.id) ?? []).sort((a, b) => a.startMs - b.startMs)

    return {
      id: profile.id,
      name: profile.full_name as string,
      initials: initials(profile.full_name as string),
      skills: many(profile.staff_skills).map((row) => (one(row.skills)?.name as string) ?? ""),
      locations: many(profile.staff_locations).map((row) => {
        const location = one(row.locations)
        return {
          id: (location?.id as string) ?? "",
          name: (location?.name as string) ?? "",
          certified: (row.certified as boolean) ?? false,
        }
      }),
      desiredHours: profile.desired_hours as number,
      weekHours: Math.round(hoursByStaff.get(profile.id) ?? 0),
      shifts,
    }
  })
}
