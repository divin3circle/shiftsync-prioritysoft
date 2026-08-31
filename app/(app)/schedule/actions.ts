"use server"

import { revalidatePath } from "next/cache"

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
