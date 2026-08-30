import {
  AnalyticsUpIcon,
  Alert02Icon,
  Clock01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons"

import { overtimeStats } from "@/lib/mock/overtime"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { OvertimeTable } from "@/components/overtime/overtime-table"

export default function OvertimePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overtime"
        description="Projected hours, costs, and labor-law warnings for this week."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Projected overtime cost"
          value={overtimeStats.projectedCost}
          hint="this week"
          icon={AnalyticsUpIcon}
          emphasis="warning"
        />
        <StatCard
          label="Over 40 hours"
          value={String(overtimeStats.overForty)}
          hint="staff in overtime"
          icon={Alert02Icon}
          emphasis="warning"
        />
        <StatCard
          label="Approaching (35h+)"
          value={String(overtimeStats.approaching)}
          hint="watch closely"
          icon={Clock01Icon}
        />
        <StatCard
          label="Override needed"
          value={String(overtimeStats.overrideNeeded)}
          hint="seventh consecutive day"
          icon={CheckmarkBadge01Icon}
          emphasis="warning"
        />
      </div>
      <OvertimeTable />
    </div>
  )
}
