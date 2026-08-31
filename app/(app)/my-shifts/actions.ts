"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"

export async function requestCoverage(
  shiftId: string,
  assignmentId: string,
  type: "drop" | "swap",
): Promise<{ ok: boolean; message?: string }> {
  const user = await getSessionUser()
  if (!user) return { ok: false, message: "Please sign in again." }

  const supabase = await createClient()
  const { error } = await supabase.from("swap_requests").insert({
    type,
    requester_id: user.id,
    shift_id: shiftId,
    assignment_id: assignmentId,
    status: "pending_manager",
  })

  if (error) return { ok: false, message: error.message }

  revalidatePath("/my-shifts")
  revalidatePath("/swaps")
  return { ok: true }
}
