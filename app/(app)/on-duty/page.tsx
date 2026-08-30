import { PageHeader } from "@/components/common/page-header"
import { OnDutyBoard } from "@/components/on-duty/on-duty-board"

export default function OnDutyPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="On duty"
        description="Who is clocked in right now, shown in each location's timezone."
      />
      <OnDutyBoard />
    </div>
  )
}
