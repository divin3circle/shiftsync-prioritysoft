import { getSessionUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getLocations, getSkills, getWeekBoard } from "@/lib/data/schedule"
import { PageHeader } from "@/components/common/page-header"
import { ScheduleBoard } from "@/components/schedule/schedule-board"

async function canManageLocation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: string,
  locationId: string,
) {
  if (role === "admin") return true
  if (role !== "manager") return false
  const { data } = await supabase
    .from("manager_locations")
    .select("location_id")
    .eq("profile_id", userId)
    .eq("location_id", locationId)
  return (data ?? []).length > 0
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; wk?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const user = await getSessionUser()
  const [locations, skills] = await Promise.all([getLocations(supabase), getSkills(supabase)])

  const location = locations.find((item) => item.id === params.loc) ?? locations[0]
  const weekOffset = Number.parseInt(params.wk ?? "0", 10) || 0
  const board = await getWeekBoard(supabase, location, weekOffset)
  const canManage = user
    ? await canManageLocation(supabase, user.id, user.role, location.id)
    : false

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Schedule" description="Build, assign, and publish the weekly schedule." />
      <ScheduleBoard
        locations={locations}
        skills={skills}
        location={location}
        board={board}
        weekOffset={weekOffset}
        canManage={canManage}
      />
    </div>
  )
}
