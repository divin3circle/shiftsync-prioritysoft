import { PageHeader } from "@/components/common/page-header"
import { AvailabilityEditor } from "@/components/availability/availability-editor"

export default function AvailabilityPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Availability"
        description="Set the recurring hours and exceptions when you can work."
      />
      <AvailabilityEditor />
    </div>
  )
}
