import { getSessionUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getAvailability } from "@/lib/data/availability"
import { PageHeader } from "@/components/common/page-header"
import { AvailabilityEditor } from "@/components/availability/availability-editor"

export default async function AvailabilityPage() {
  const user = await getSessionUser()
  const supabase = await createClient()
  const availability = user
    ? await getAvailability(supabase, user.id)
    : { timezone: "America/Los_Angeles", days: [], exceptions: [] }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Availability"
        description="Set the recurring hours and exceptions when you can work."
      />
      <AvailabilityEditor availability={availability} />
    </div>
  )
}
