import { PageHeader } from "@/components/common/page-header"
import { StaffTable } from "@/components/staff/staff-table"

export default function StaffPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Staff" description="Roster with skills, certifications, and scheduled hours." />
      <StaffTable />
    </div>
  )
}
