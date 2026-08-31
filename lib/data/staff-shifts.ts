import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

export type StaffShift = {
  assignmentId: string
  shiftId: string
  location: string
  dayLabel: string
  timeLabel: string
  role: string
  premium: boolean
  startMs: number
}

export type OpenShift = {
  shiftId: string
  location: string
  whenLabel: string
  role: string
  startMs: number
  canClaim: boolean
  reason: string | null
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value
  return (row as Record<string, unknown>) ?? null
}

function labels(startISO: string, endISO: string, timezone: string) {
  const start = DateTime.fromISO(startISO, { zone: "utc" }).setZone(timezone)
  const end = DateTime.fromISO(endISO, { zone: "utc" }).setZone(timezone)
  return {
    dayLabel: start.toFormat("EEE, MMM d"),
    timeLabel: `${start.toFormat("h:mm a")} - ${end.toFormat("h:mm a")}`,
    startMs: start.toMillis(),
  }
}

export async function getMyShifts(
  supabase: SupabaseClient,
  userId: string,
): Promise<StaffShift[]> {
  const { data } = await supabase
    .from("assignments")
    .select(
      "id, shift_id, shifts(starts_at, ends_at, is_premium, skills(name), locations(name, timezone))",
    )
    .eq("staff_id", userId)
    .eq("status", "active")

  return (data ?? [])
    .map((row) => {
      const shift = one(row.shifts)
      const location = one(shift?.locations)
      const skill = one(shift?.skills)
      const timezone = (location?.timezone as string) ?? "America/Los_Angeles"
      const { dayLabel, timeLabel, startMs } = labels(
        shift?.starts_at as string,
        shift?.ends_at as string,
        timezone,
      )
      return {
        assignmentId: row.id as string,
        shiftId: row.shift_id as string,
        location: (location?.name as string) ?? "",
        dayLabel,
        timeLabel,
        role: (skill?.name as string) ?? "",
        premium: (shift?.is_premium as boolean) ?? false,
        startMs,
      }
    })
    .sort((a, b) => a.startMs - b.startMs)
}

export async function getOpenShiftsForStaff(
  supabase: SupabaseClient,
  userId: string,
): Promise<OpenShift[]> {
  const [skillRows, locationRows] = await Promise.all([
    supabase.from("staff_skills").select("skill_id").eq("profile_id", userId),
    supabase.from("staff_locations").select("location_id, certified").eq("profile_id", userId),
  ])

  const skillIds = new Set((skillRows.data ?? []).map((row) => row.skill_id))
  const certified = new Map(
    (locationRows.data ?? []).map((row) => [row.location_id, row.certified]),
  )
  const locationIds = [...certified.keys()]
  if (locationIds.length === 0) return []

  const { data } = await supabase
    .from("shifts")
    .select(
      "id, location_id, starts_at, ends_at, headcount, required_skill_id, skills(name), locations(name, timezone), assignments(status)",
    )
    .in("location_id", locationIds)
    .eq("published", true)

  return (data ?? [])
    .map((row) => {
      const assignments = (row.assignments as { status: string }[] | null) ?? []
      const filled = assignments.filter((assignment) => assignment.status === "active").length
      return { row, filled }
    })
    .filter(({ row, filled }) => filled < (row.headcount as number))
    .map(({ row }) => {
      const location = one(row.locations)
      const skill = one(row.skills)
      const timezone = (location?.timezone as string) ?? "America/Los_Angeles"
      const { dayLabel, timeLabel, startMs } = labels(
        row.starts_at as string,
        row.ends_at as string,
        timezone,
      )
      const role = (skill?.name as string) ?? ""
      const isCertified = certified.get(row.location_id as string) === true
      const isQualified = !row.required_skill_id || skillIds.has(row.required_skill_id)

      return {
        shiftId: row.id as string,
        location: (location?.name as string) ?? "",
        whenLabel: `${dayLabel}, ${timeLabel}`,
        role,
        startMs,
        canClaim: isCertified && isQualified,
        reason: !isCertified ? "Not certified here" : !isQualified ? `Requires ${role}` : null,
      }
    })
    .sort((a, b) => a.startMs - b.startMs)
}
