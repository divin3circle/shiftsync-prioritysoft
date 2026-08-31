import { createClient } from "@/lib/supabase/server"
import { getOnDuty } from "@/lib/data/on-duty"
import { PageHeader } from "@/components/common/page-header"
import { OnDutyBoard } from "@/components/on-duty/on-duty-board"

export default async function OnDutyPage() {
  const supabase = await createClient()
  const locations = await getOnDuty(supabase)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="On duty"
        description="Who is clocked in right now, shown in each location's timezone."
      />
      <OnDutyBoard locations={locations} />
    </div>
  )
}
