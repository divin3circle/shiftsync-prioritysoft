import { createClient } from "@/lib/supabase/server"
import { getRoster } from "@/lib/data/roster"
import { PageHeader } from "@/components/common/page-header"
import { StaffTable } from "@/components/staff/staff-table"

export default async function StaffPage() {
  const supabase = await createClient()
  const members = await getRoster(supabase)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Staff" description="Roster with skills, certifications, and scheduled hours." />
      <StaffTable members={members} />
    </div>
  )
}
