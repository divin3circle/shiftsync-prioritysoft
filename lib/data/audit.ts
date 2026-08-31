import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

export type AuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  target: string
  change: string
}

const verbs: Record<string, string> = { INSERT: "Created", UPDATE: "Updated", DELETE: "Removed" }
const entities: Record<string, string> = {
  shifts: "a shift",
  assignments: "an assignment",
  swap_requests: "a request",
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value
  return (row as Record<string, unknown>) ?? null
}

const skip = new Set(["id", "created_at", "updated_at"])

function summarizeChange(
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): string {
  if (action === "UPDATE" && before && after) {
    const changed = Object.keys(after)
      .filter((key) => !skip.has(key) && String(before[key]) !== String(after[key]))
      .slice(0, 2)
      .map((key) => `${key}: ${before[key]} to ${after[key]}`)
    return changed.join(", ")
  }
  if (action === "INSERT" && after?.status) return `status: ${after.status}`
  return ""
}

export async function getAuditLog(supabase: SupabaseClient, max = 40): Promise<AuditEntry[]> {
  const { data } = await supabase
    .from("audit_log")
    .select(
      "id, entity, action, before, after, created_at, actor:profiles!audit_log_actor_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(max)

  return (data ?? []).map((row) => ({
    id: String(row.id),
    time: DateTime.fromISO(row.created_at as string).toFormat("MMM d, h:mm a"),
    actor: (one(row.actor)?.full_name as string) ?? "System",
    action: `${verbs[row.action as string] ?? row.action} ${entities[row.entity as string] ?? row.entity}`,
    target: row.entity as string,
    change: summarizeChange(
      row.action as string,
      row.before as Record<string, unknown> | null,
      row.after as Record<string, unknown> | null,
    ),
  }))
}
