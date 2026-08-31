import { createClient } from "@/lib/supabase/server"
import { getLocations, getSkills, getWeekBoard } from "@/lib/data/schedule"
import { PageHeader } from "@/components/common/page-header"
import { ScheduleBoard } from "@/components/schedule/schedule-board"

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; wk?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const [locations, skills] = await Promise.all([getLocations(supabase), getSkills(supabase)])

  const location = locations.find((item) => item.id === params.loc) ?? locations[0]
  const weekOffset = Number.parseInt(params.wk ?? "0", 10) || 0
  const board = await getWeekBoard(supabase, location, weekOffset)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Schedule" description="Build, assign, and publish the weekly schedule." />
      <ScheduleBoard
        locations={locations}
        skills={skills}
        location={location}
        board={board}
        weekOffset={weekOffset}
      />
    </div>
  )
}
