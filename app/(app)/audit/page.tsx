import { createClient } from "@/lib/supabase/server"
import { getAuditLog } from "@/lib/data/audit"
import { PageHeader } from "@/components/common/page-header"
import { AuditLog } from "@/components/audit/audit-log"

export default async function AuditPage() {
  const supabase = await createClient()
  const entries = await getAuditLog(supabase)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Every schedule change, who made it, and the before and after."
      />
      <AuditLog entries={entries} />
    </div>
  )
}
