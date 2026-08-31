import {
  Clock01Icon,
  Tag01Icon,
  ArrowDataTransferHorizontalIcon,
  AnalyticsUpIcon,
} from "@hugeicons/core-free-icons"

import type { DashboardStat, ShiftRow, DashboardAlert } from "@/lib/mock/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { SectionCard } from "@/components/common/section-card"
import { LinkButton } from "@/components/common/link-button"
import { ShiftList } from "@/components/dashboard/shift-list"
import { AlertList } from "@/components/dashboard/alert-list"

const statIcons = [Clock01Icon, Tag01Icon, ArrowDataTransferHorizontalIcon, AnalyticsUpIcon]

export function ManagerDashboard({
  data,
}: {
  data: { stats: DashboardStat[]; today: ShiftRow[]; alerts: DashboardAlert[] }
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} icon={statIcons[index]} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Today across locations"
          action={
            <LinkButton href="/schedule" variant="ghost" size="sm">
              Open schedule
            </LinkButton>
          }
        >
          <ShiftList rows={data.today} />
        </SectionCard>
        <SectionCard
          title="Needs attention"
          action={
            <LinkButton href="/overtime" variant="ghost" size="sm">
              Review
            </LinkButton>
          }
        >
          <AlertList alerts={data.alerts} />
        </SectionCard>
      </div>
    </div>
  )
}
