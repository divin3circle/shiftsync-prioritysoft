import type { SupabaseClient } from "@supabase/supabase-js"

import { checkAssignment } from "@/lib/scheduling/constraints"
import type {
  ProposedShift,
  RuleCode,
  StaffContext,
  Violation,
} from "@/lib/scheduling/types"

// Double-booking, missing skill, and missing certification are hard stops.
// Everything else (rest, availability, overtime, long streaks) can be assigned
// through with an explicit override.
const hardRules: RuleCode[] = ["overlap", "skill", "certification"]

export type AssignmentCheck = {
  ok: boolean
  blocking: Violation[]
  overridable: Violation[]
}

function nestedName(value: unknown): string {
  const row = Array.isArray(value) ? value[0] : value
  return (row as { name?: string } | null)?.name ?? ""
}

function timeToHhMm(value: string): string {
  return value.slice(0, 5)
}

async function loadProposal(
  supabase: SupabaseClient,
  shiftId: string,
): Promise<ProposedShift> {
  const { data, error } = await supabase
    .from("shifts")
    .select("location_id, starts_at, ends_at, skills(name)")
    .eq("id", shiftId)
    .single()
  if (error || !data) throw new Error(error?.message ?? "Shift not found")

  return {
    locationId: data.location_id,
    requiredSkill: nestedName(data.skills),
    start: new Date(data.starts_at),
    end: new Date(data.ends_at),
  }
}

async function loadStaffContext(
  supabase: SupabaseClient,
  staffId: string,
  excludeShiftId: string,
): Promise<StaffContext> {
  const [profile, skillRows, locationRows, availabilityRows, assignmentRows] =
    await Promise.all([
      supabase.from("profiles").select("home_tz").eq("id", staffId).single(),
      supabase.from("staff_skills").select("skills(name)").eq("profile_id", staffId),
      supabase
        .from("staff_locations")
        .select("location_id")
        .eq("profile_id", staffId)
        .eq("certified", true),
      supabase
        .from("availability_recurring")
        .select("weekday, start_time, end_time")
        .eq("profile_id", staffId),
      supabase
        .from("assignments")
        .select("starts_at, ends_at, shifts(location_id)")
        .eq("staff_id", staffId)
        .eq("status", "active")
        .neq("shift_id", excludeShiftId),
    ])

  return {
    skills: (skillRows.data ?? []).map((row) => nestedName(row.skills)),
    certifiedLocationIds: (locationRows.data ?? []).map((row) => row.location_id),
    availability: (availabilityRows.data ?? []).map((row) => ({
      weekday: row.weekday,
      start: timeToHhMm(row.start_time),
      end: timeToHhMm(row.end_time),
    })),
    availabilityZone: profile.data?.home_tz ?? "America/Los_Angeles",
    existingShifts: (assignmentRows.data ?? []).map((row) => ({
      locationId: nestedName(row.shifts),
      start: new Date(row.starts_at),
      end: new Date(row.ends_at),
    })),
  }
}

export async function evaluateAssignment(
  supabase: SupabaseClient,
  shiftId: string,
  staffId: string,
): Promise<AssignmentCheck> {
  const [proposal, context] = await Promise.all([
    loadProposal(supabase, shiftId),
    loadStaffContext(supabase, staffId, shiftId),
  ])

  const { violations } = checkAssignment(proposal, context)

  return {
    ok: !violations.some((violation) => hardRules.includes(violation.rule)),
    blocking: violations.filter((violation) => hardRules.includes(violation.rule)),
    overridable: violations.filter((violation) => !hardRules.includes(violation.rule)),
  }
}

export async function commitAssignment(
  supabase: SupabaseClient,
  shiftId: string,
  staffId: string,
  actorId: string,
  overrideReason?: string,
) {
  const { data, error } = await supabase.rpc("assign_staff", {
    p_shift_id: shiftId,
    p_staff_id: staffId,
    p_actor: actorId,
  })
  if (error) throw new Error(error.message)

  if (overrideReason) {
    await supabase.from("overtime_overrides").insert({
      assignment_id: data.id,
      approved_by: actorId,
      reason: overrideReason,
    })
  }

  return data
}
