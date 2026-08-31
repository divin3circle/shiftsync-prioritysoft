"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth"

type Outcome = { ok: boolean; message?: string }

async function setStatus(id: string, status: string): Promise<Outcome> {
  const supabase = await createClient()
  const { error } = await supabase.from("swap_requests").update({ status }).eq("id", id)
  if (error) return { ok: false, message: error.message }
  revalidatePath("/swaps")
  return { ok: true }
}

// Staff accepting a swap offer sends it on to a manager for sign-off.
export async function acceptOffer(id: string): Promise<Outcome> {
  return setStatus(id, "pending_manager")
}

export async function declineOffer(id: string): Promise<Outcome> {
  return setStatus(id, "rejected")
}

export async function cancelRequest(id: string): Promise<Outcome> {
  return setStatus(id, "cancelled")
}

// A manager approving a drop frees the shift by cancelling the assignment.
export async function approveRequest(
  id: string,
  type: "swap" | "drop",
  assignmentId: string | null,
): Promise<Outcome> {
  const user = await getSessionUser()
  if (!user || user.role === "staff") {
    return { ok: false, message: "Only managers can approve requests." }
  }

  const supabase = await createClient()
  if (type === "drop" && assignmentId) {
    const { error } = await supabase
      .from("assignments")
      .update({ status: "cancelled" })
      .eq("id", assignmentId)
    if (error) return { ok: false, message: error.message }
  }

  const { error } = await supabase.from("swap_requests").update({ status: "approved" }).eq("id", id)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/swaps")
  revalidatePath("/schedule")
  return { ok: true }
}

export async function denyRequest(id: string): Promise<Outcome> {
  const user = await getSessionUser()
  if (!user || user.role === "staff") {
    return { ok: false, message: "Only managers can deny requests." }
  }
  return setStatus(id, "rejected")
}
