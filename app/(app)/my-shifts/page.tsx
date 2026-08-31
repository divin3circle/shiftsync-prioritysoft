import { getSessionUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getMyShifts } from "@/lib/data/staff-shifts"
import { PageHeader } from "@/components/common/page-header"
import { MyShiftsList } from "@/components/my-shifts/my-shifts-list"

export default async function MyShiftsPage() {
  const user = await getSessionUser()
  const supabase = await createClient()
  const shifts = user ? await getMyShifts(supabase, user.id) : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My shifts" description="Your shifts this week at Coastal Eats." />
      <MyShiftsList shifts={shifts} />
    </div>
  )
}
