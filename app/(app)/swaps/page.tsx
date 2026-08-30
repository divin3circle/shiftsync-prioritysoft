import { PageHeader } from "@/components/common/page-header"
import { SwapsView } from "@/components/swaps/swaps-view"

export default function SwapsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Swaps & coverage"
        description="Request swaps, drop shifts, and approve coverage changes."
      />
      <SwapsView />
    </div>
  )
}
