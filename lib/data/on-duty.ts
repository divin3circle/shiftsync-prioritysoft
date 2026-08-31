import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

import { getLocations } from "@/lib/data/schedule"
import { initials } from "@/lib/initials"

export type OnDutyEntry = {
  name: string
  initials: string
  role: string
  since: string
  until: string
}

export type OnDutyLocation = {
  id: string
  name: string
  tzLabel: string
  entries: OnDutyEntry[]
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value
  return (row as Record<string, unknown>) ?? null
}

export async function getOnDuty(supabase: SupabaseClient): Promise<OnDutyLocation[]> {
  const now = new Date().toISOString()
  const locations = await getLocations(supabase)

  const { data } = await supabase
    .from("assignments")
    .select(
      "starts_at, ends_at, staff:profiles!assignments_staff_id_fkey(full_name), shifts(location_id, skills(name), locations(timezone))",
    )
    .eq("status", "active")
    .lte("starts_at", now)
    .gt("ends_at", now)

  const byLocation = new Map<string, OnDutyEntry[]>()
  for (const row of data ?? []) {
    const shift = one(row.shifts)
    const location = one(shift?.locations)
    const staff = one(row.staff)
    const tz = (location?.timezone as string) ?? "America/Los_Angeles"
    const name = (staff?.full_name as string) ?? ""
    const entry: OnDutyEntry = {
      name,
      initials: initials(name),
      role: (one(shift?.skills)?.name as string) ?? "",
      since: DateTime.fromISO(row.starts_at as string, { zone: "utc" }).setZone(tz).toFormat("h:mm a"),
      until: DateTime.fromISO(row.ends_at as string, { zone: "utc" }).setZone(tz).toFormat("h:mm a"),
    }
    const key = shift?.location_id as string
    byLocation.set(key, [...(byLocation.get(key) ?? []), entry])
  }

  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    tzLabel: location.tzLabel,
    entries: byLocation.get(location.id) ?? [],
  }))
}
