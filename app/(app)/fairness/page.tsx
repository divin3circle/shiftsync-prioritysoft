import { PageHeader } from "@/components/common/page-header"
import { FairnessView } from "@/components/fairness/fairness-view"

export default function FairnessPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fairness"
        description="How evenly hours and premium shifts are shared across the team."
      />
      <FairnessView />
    </div>
  )
}
