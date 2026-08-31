import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

export type SwapStatus =
  | "pending_target"
  | "pending_manager"
  | "open"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired"

export type SwapRequestView = {
  id: string
  type: "swap" | "drop"
  status: SwapStatus
  requesterId: string
  requester: string
  targetId: string | null
  target: string | null
  assignmentId: string | null
  location: string
  when: string
  role: string
  note: string
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value
  return (row as Record<string, unknown>) ?? null
}

export async function getSwapRequests(supabase: SupabaseClient): Promise<SwapRequestView[]> {
  const { data } = await supabase
    .from("swap_requests")
    .select(
      "id, type, status, reason, requester_id, target_id, assignment_id, requester:profiles!swap_requests_requester_id_fkey(full_name), target:profiles!swap_requests_target_id_fkey(full_name), shifts(starts_at, ends_at, skills(name), locations(name, timezone))",
    )
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => {
    const shift = one(row.shifts)
    const location = one(shift?.locations)
    const tz = (location?.timezone as string) ?? "America/Los_Angeles"
    const start = DateTime.fromISO(shift?.starts_at as string, { zone: "utc" }).setZone(tz)
    const end = DateTime.fromISO(shift?.ends_at as string, { zone: "utc" }).setZone(tz)

    return {
      id: row.id as string,
      type: row.type as "swap" | "drop",
      status: row.status as SwapStatus,
      requesterId: row.requester_id as string,
      requester: (one(row.requester)?.full_name as string) ?? "",
      targetId: (row.target_id as string) ?? null,
      target: (one(row.target)?.full_name as string) ?? null,
      assignmentId: (row.assignment_id as string) ?? null,
      location: (location?.name as string) ?? "",
      when: `${start.toFormat("EEE h:mm a")} - ${end.toFormat("h:mm a")}`,
      role: (one(shift?.skills)?.name as string) ?? "",
      note: (row.reason as string) ?? "",
    }
  })
}
