import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

import { limits } from "@/lib/scheduling/types"

export type OvertimeStatus = "ok" | "approaching" | "overtime"
export type SchedulingStatus = "under" | "on_target" | "over"

export type StaffMetric = {
  id: string
  name: string
  desiredHours: number
  hours: number
  premiumShifts: number
  consecutiveDays: number
  status: OvertimeStatus
  scheduling: SchedulingStatus
}

export function longestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const sorted = [...dates].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = DateTime.fromISO(sorted[i]).diff(DateTime.fromISO(sorted[i - 1]), "days").days
    run = gap === 1 ? run + 1 : 1
    best = Math.max(best, run)
  }
  return best
}

export async function getStaffWeekMetrics(supabase: SupabaseClient): Promise<StaffMetric[]> {
  const start = DateTime.now().setZone("America/New_York").startOf("week")
  const end = DateTime.now().setZone("America/Los_Angeles").startOf("week").plus({ days: 7 })

  const [{ data: profiles }, { data: rows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, desired_hours, home_tz")
      .eq("role", "staff")
      .order("full_name"),
    supabase
      .from("assignments")
      .select("staff_id, starts_at, ends_at, shifts(is_premium)")
      .eq("status", "active")
      .gte("starts_at", start.toUTC().toISO())
      .lt("starts_at", end.toUTC().toISO()),
  ])

  const zone = new Map((profiles ?? []).map((p) => [p.id, p.home_tz as string]))
  const acc = new Map<string, { hours: number; premium: number; dates: Set<string> }>()

  for (const row of rows ?? []) {
    const shift = Array.isArray(row.shifts) ? row.shifts[0] : row.shifts
    const entry = acc.get(row.staff_id) ?? { hours: 0, premium: 0, dates: new Set<string>() }
    entry.hours +=
      (new Date(row.ends_at as string).getTime() - new Date(row.starts_at as string).getTime()) /
      3_600_000
    if (shift?.is_premium) entry.premium += 1
    const day = DateTime.fromISO(row.starts_at as string, { zone: "utc" })
      .setZone(zone.get(row.staff_id) ?? "America/Los_Angeles")
      .toISODate()
    if (day) entry.dates.add(day)
    acc.set(row.staff_id, entry)
  }

  return (profiles ?? []).map((profile) => {
    const entry = acc.get(profile.id) ?? { hours: 0, premium: 0, dates: new Set<string>() }
    const hours = Math.round(entry.hours)
    const desired = profile.desired_hours as number

    const status: OvertimeStatus =
      hours > limits.weeklyLimitHours
        ? "overtime"
        : hours >= limits.weeklyWarnHours
          ? "approaching"
          : "ok"

    const scheduling: SchedulingStatus =
      hours > desired ? "over" : hours >= Math.round(desired * 0.8) ? "on_target" : "under"

    return {
      id: profile.id,
      name: profile.full_name as string,
      desiredHours: desired,
      hours,
      premiumShifts: entry.premium,
      consecutiveDays: longestStreak(entry.dates),
      status,
      scheduling,
    }
  })
}
