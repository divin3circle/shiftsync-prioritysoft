import { createClient } from "@/lib/supabase/server"
import { getSwapRequests } from "@/lib/data/swaps"
import { PageHeader } from "@/components/common/page-header"
import { SwapsView } from "@/components/swaps/swaps-view"

export default async function SwapsPage() {
  const supabase = await createClient()
  const requests = await getSwapRequests(supabase)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Swaps & coverage"
        description="Request swaps, drop shifts, and approve coverage changes."
      />
      <SwapsView requests={requests} />
    </div>
  )
}
