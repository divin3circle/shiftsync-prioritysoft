import { PageHeader } from "@/components/common/page-header"
import { OpenShifts } from "@/components/pickup/open-shifts"

export default function PickupPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Open shifts"
        description="Claim available shifts you are qualified and certified for."
      />
      <OpenShifts />
    </div>
  )
}
