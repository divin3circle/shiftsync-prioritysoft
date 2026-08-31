"use server"

import { revalidatePath } from "next/cache"

import { DateTime } from "luxon"

import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { evaluateAssignment, commitAssignment } from "@/lib/data/assignment"
import { weekBounds } from "@/lib/data/schedule"
import type { Violation } from "@/lib/scheduling/types"

export type Candidate = {
  id: string
  name: string
  status: "ready" | "warn" | "blocked"
  blocking: Violation[]
  overridable: Violation[]
}

export type AssignResult =
  | { status: "assigned" }
  | { status: "blocked"; reasons: Violation[] }
  | { status: "needsOverride"; warnings: Violation[] }
  | { status: "error"; message: string }

async function requireManager() {
  const user = await getSessionUser()
  if (!user || user.role === "staff") return null
  return user
}

export async function getShiftCandidates(shiftId: string): Promise<Candidate[]> {
  const user = await requireManager()
  if (!user) return []

  const supabase = await createClient()
  const { data: shift } = await supabase
    .from("shifts")
    .select("location_id")
    .eq("id", shiftId)
    .single()
  if (!shift) return []

  const { data: roster } = await supabase
    .from("staff_locations")
    .select("staff:profiles!staff_locations_profile_id_fkey(id, full_name)")
    .eq("location_id", shift.location_id)

  const candidates = await Promise.all(
    (roster ?? []).map(async (row) => {
      const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff
      const person = staff as { id: string; full_name: string }
      const check = await evaluateAssignment(supabase, shiftId, person.id)
      const status = check.blocking.length ? "blocked" : check.overridable.length ? "warn" : "ready"
      return {
        id: person.id,
        name: person.full_name,
        status: status as Candidate["status"],
        blocking: check.blocking,
        overridable: check.overridable,
      }
    }),
  )

  const rank = { ready: 0, warn: 1, blocked: 2 }
  return candidates.sort((a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name))
}

export async function assignToShift(
  shiftId: string,
  staffId: string,
  confirmOverride: boolean,
): Promise<AssignResult> {
  const user = await requireManager()
  if (!user) return { status: "error", message: "You do not have permission to assign shifts." }

  const supabase = await createClient()
  const check = await evaluateAssignment(supabase, shiftId, staffId)

  if (check.blocking.length) return { status: "blocked", reasons: check.blocking }
  if (check.overridable.length && !confirmOverride) {
    return { status: "needsOverride", warnings: check.overridable }
  }

  const overtime = check.overridable.some(
    (violation) => violation.rule === "weekly_hours" || violation.rule === "daily_hours",
  )

  try {
    await commitAssignment(
      supabase,
      shiftId,
      staffId,
      user.id,
      overtime && confirmOverride ? `Overtime approved by ${user.name}` : undefined,
    )
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not assign this shift.",
    }
  }

  revalidatePath("/schedule")
  return { status: "assigned" }
}

export type NewShiftInput = {
  locationId: string
  weekOffset: number
  dayIndex: number
  start: string
  end: string
  skillId: string
  headcount: number
}

export async function createShift(input: NewShiftInput): Promise<{ ok: boolean; message?: string }> {
  const user = await requireManager()
  if (!user) return { ok: false, message: "Only managers can add shifts." }

  const supabase = await createClient()
  const { data: location } = await supabase
    .from("locations")
    .select("timezone")
    .eq("id", input.locationId)
    .single()
  if (!location) return { ok: false, message: "Location not found." }

  const tz = location.timezone as string
  const { start: weekStart } = weekBounds(tz, input.weekOffset)
  const day = weekStart.plus({ days: input.dayIndex })

  const [startHour, startMinute] = input.start.split(":").map(Number)
  const [endHour, endMinute] = input.end.split(":").map(Number)
  const startsAt = day.set({ hour: startHour, minute: startMinute })
  let endsAt = day.set({ hour: endHour, minute: endMinute })
  // An end at or before the start means the shift runs past midnight.
  if (endsAt <= startsAt) endsAt = endsAt.plus({ days: 1 })

  const { error } = await supabase.from("shifts").insert({
    location_id: input.locationId,
    starts_at: startsAt.toUTC().toISO(),
    ends_at: endsAt.toUTC().toISO(),
    required_skill_id: input.skillId,
    headcount: input.headcount,
    published: false,
    created_by: user.id,
  })
  if (error) return { ok: false, message: error.message }

  revalidatePath("/schedule")
  return { ok: true }
}

export async function updateShift(
  shiftId: string,
  input: { startTime: string; endTime: string; skillId: string; headcount: number },
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireManager()
  if (!user) return { ok: false, message: "Only managers can edit shifts." }

  const supabase = await createClient()
  const { data: shift } = await supabase
    .from("shifts")
    .select("starts_at, locations(timezone)")
    .eq("id", shiftId)
    .single()
  if (!shift) return { ok: false, message: "Shift not found." }

  const location = Array.isArray(shift.locations) ? shift.locations[0] : shift.locations
  const tz = (location?.timezone as string) ?? "America/Los_Angeles"
  const day = DateTime.fromISO(shift.starts_at as string, { zone: "utc" }).setZone(tz).startOf("day")

  const [startHour, startMinute] = input.startTime.split(":").map(Number)
  const [endHour, endMinute] = input.endTime.split(":").map(Number)
  const startsAt = day.set({ hour: startHour, minute: startMinute })
  let endsAt = day.set({ hour: endHour, minute: endMinute })
  if (endsAt <= startsAt) endsAt = endsAt.plus({ days: 1 })

  // Move any assignments first: if the new time double-books someone, the
  // exclusion constraint rejects it and the shift is left untouched.
  const cascade = await supabase
    .from("assignments")
    .update({ starts_at: startsAt.toUTC().toISO(), ends_at: endsAt.toUTC().toISO() })
    .eq("shift_id", shiftId)
    .eq("status", "active")
  if (cascade.error) return { ok: false, message: cascade.error.message }

  const { error } = await supabase
    .from("shifts")
    .update({
      starts_at: startsAt.toUTC().toISO(),
      ends_at: endsAt.toUTC().toISO(),
      required_skill_id: input.skillId,
      headcount: input.headcount,
    })
    .eq("id", shiftId)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/schedule")
  return { ok: true }
}

export async function deleteShift(shiftId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await requireManager()
  if (!user) return { ok: false, message: "Only managers can remove shifts." }

  const supabase = await createClient()
  const { error } = await supabase.from("shifts").delete().eq("id", shiftId)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/schedule")
  return { ok: true }
}

export async function setWeekPublished(
  locationId: string,
  weekOffset: number,
  published: boolean,
): Promise<void> {
  const user = await requireManager()
  if (!user) return

  const supabase = await createClient()
  const { data: location } = await supabase
    .from("locations")
    .select("timezone")
    .eq("id", locationId)
    .single()
  if (!location) return

  const { start, end } = weekBounds(location.timezone, weekOffset)
  await supabase
    .from("shifts")
    .update({ published })
    .eq("location_id", locationId)
    .gte("starts_at", start.toUTC().toISO())
    .lt("starts_at", end.toUTC().toISO())

  revalidatePath("/schedule")
}
