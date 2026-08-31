import { getSessionUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getOpenShiftsForStaff } from "@/lib/data/staff-shifts"
import { PageHeader } from "@/components/common/page-header"
import { OpenShifts } from "@/components/pickup/open-shifts"

export default async function PickupPage() {
  const user = await getSessionUser()
  const supabase = await createClient()
  const shifts = user ? await getOpenShiftsForStaff(supabase, user.id) : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Open shifts"
        description="Claim available shifts you are qualified and certified for."
      />
      <OpenShifts shifts={shifts} />
    </div>
  )
}
