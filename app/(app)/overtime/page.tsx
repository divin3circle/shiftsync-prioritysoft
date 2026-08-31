import {
  AnalyticsUpIcon,
  Alert02Icon,
  Clock01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons"

import { createClient } from "@/lib/supabase/server"
import { getStaffWeekMetrics } from "@/lib/data/staff-metrics"
import { limits } from "@/lib/scheduling/types"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { OvertimeTable } from "@/components/overtime/overtime-table"

// A rough blended overtime premium, used only to turn hours into a headline number.
const overtimeRate = 24

export default async function OvertimePage() {
  const supabase = await createClient()
  const metrics = (await getStaffWeekMetrics(supabase)).sort((a, b) => b.hours - a.hours)

  const overtimeHours = metrics.reduce(
    (total, row) => total + Math.max(0, row.hours - limits.weeklyLimitHours),
    0,
  )
  const overForty = metrics.filter((row) => row.status === "overtime").length
  const approaching = metrics.filter((row) => row.status === "approaching").length
  const overrideNeeded = metrics.filter(
    (row) => row.consecutiveDays >= limits.consecutiveOverrideDays,
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overtime"
        description="Projected hours, costs, and labor-law warnings for this week."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Projected overtime cost"
          value={`$${(overtimeHours * overtimeRate).toLocaleString()}`}
          hint="this week"
          icon={AnalyticsUpIcon}
          emphasis={overtimeHours > 0 ? "warning" : undefined}
        />
        <StatCard
          label="Over 40 hours"
          value={String(overForty)}
          hint="staff in overtime"
          icon={Alert02Icon}
          emphasis={overForty > 0 ? "warning" : undefined}
        />
        <StatCard
          label="Approaching (35h+)"
          value={String(approaching)}
          hint="watch closely"
          icon={Clock01Icon}
        />
        <StatCard
          label="Override needed"
          value={String(overrideNeeded)}
          hint="seventh consecutive day"
          icon={CheckmarkBadge01Icon}
          emphasis={overrideNeeded > 0 ? "warning" : undefined}
        />
      </div>
      <OvertimeTable rows={metrics} />
    </div>
  )
}
