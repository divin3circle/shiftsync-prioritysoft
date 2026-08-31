import { createClient } from "@/lib/supabase/server"
import type { SessionUser } from "@/components/role-provider"

function initialsFrom(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()
  if (!profile) return null

  return {
    id: user.id,
    name: profile.full_name,
    email: user.email ?? "",
    role: profile.role,
    initials: initialsFrom(profile.full_name),
  }
}
