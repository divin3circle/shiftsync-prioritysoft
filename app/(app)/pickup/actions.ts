"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"
import { evaluateAssignment, commitAssignment } from "@/lib/data/assignment"

export type ClaimResult =
  | { status: "claimed" }
  | { status: "blocked"; message: string }
  | { status: "error"; message: string }

export async function claimOpenShift(shiftId: string): Promise<ClaimResult> {
  const user = await getSessionUser()
  if (!user) return { status: "error", message: "Please sign in again." }

  const supabase = await createClient()
  const check = await evaluateAssignment(supabase, shiftId, user.id)
  if (check.blocking.length) {
    return { status: "blocked", message: check.blocking[0].message }
  }

  try {
    await commitAssignment(supabase, shiftId, user.id, user.id)
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not claim this shift.",
    }
  }

  revalidatePath("/pickup")
  revalidatePath("/my-shifts")
  return { status: "claimed" }
}
