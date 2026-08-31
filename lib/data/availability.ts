import type { SupabaseClient } from "@supabase/supabase-js"

export type DayWindow = { enabled: boolean; start: string; end: string }

export type AvailabilityException = {
  id: string
  date: string
  note: string
  kind: "available" | "unavailable"
}

export type Availability = {
  timezone: string
  days: DayWindow[]
  exceptions: AvailabilityException[]
}

const emptyDay: DayWindow = { enabled: false, start: "09:00", end: "17:00" }

export async function getAvailability(
  supabase: SupabaseClient,
  userId: string,
): Promise<Availability> {
  const [{ data: profile }, { data: recurring }, { data: exceptions }] = await Promise.all([
    supabase.from("profiles").select("home_tz").eq("id", userId).single(),
    supabase
      .from("availability_recurring")
      .select("weekday, start_time, end_time")
      .eq("profile_id", userId),
    supabase
      .from("availability_exceptions")
      .select("id, exception_date, kind, note")
      .eq("profile_id", userId)
      .order("exception_date"),
  ])

  // weekday is ISO (1 = Monday), the array is Monday-first, so index = weekday - 1.
  const days: DayWindow[] = Array.from({ length: 7 }, () => ({ ...emptyDay }))
  for (const row of recurring ?? []) {
    days[(row.weekday as number) - 1] = {
      enabled: true,
      start: (row.start_time as string).slice(0, 5),
      end: (row.end_time as string).slice(0, 5),
    }
  }

  return {
    timezone: (profile?.home_tz as string) ?? "America/Los_Angeles",
    days,
    exceptions: (exceptions ?? []).map((row) => ({
      id: row.id as string,
      date: row.exception_date as string,
      note: (row.note as string) ?? "",
      kind: row.kind as "available" | "unavailable",
    })),
  }
}
