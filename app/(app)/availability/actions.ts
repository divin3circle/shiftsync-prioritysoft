"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import type { DayWindow } from "@/lib/data/availability"

export async function saveAvailability(days: DayWindow[]): Promise<{ ok: boolean; message?: string }> {
  const user = await getSessionUser()
  if (!user) return { ok: false, message: "Please sign in again." }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("home_tz")
    .eq("id", user.id)
    .single()
  const timezone = (profile?.home_tz as string) ?? "America/Los_Angeles"

  // Replace the recurring windows with the submitted set.
  await supabase.from("availability_recurring").delete().eq("profile_id", user.id)

  const rows = days
    .map((day, index) => ({ day, weekday: index + 1 }))
    .filter(({ day }) => day.enabled)
    .map(({ day, weekday }) => ({
      profile_id: user.id,
      weekday,
      start_time: day.start,
      end_time: day.end,
      timezone,
    }))

  if (rows.length > 0) {
    const { error } = await supabase.from("availability_recurring").insert(rows)
    if (error) return { ok: false, message: error.message }
  }

  revalidatePath("/availability")
  return { ok: true }
}
