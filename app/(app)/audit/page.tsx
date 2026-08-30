import { PageHeader } from "@/components/common/page-header"
import { AuditLog } from "@/components/audit/audit-log"

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Every schedule change, who made it, and the before and after."
      />
      <AuditLog />
    </div>
  )
}
