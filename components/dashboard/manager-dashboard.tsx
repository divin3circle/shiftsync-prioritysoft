import {
  Clock01Icon,
  Tag01Icon,
  ArrowDataTransferHorizontalIcon,
  AnalyticsUpIcon,
} from "@hugeicons/core-free-icons"

import { managerStats, managerToday, managerAlerts } from "@/lib/mock/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { SectionCard } from "@/components/common/section-card"
import { LinkButton } from "@/components/common/link-button"
import { ShiftList } from "@/components/dashboard/shift-list"
import { AlertList } from "@/components/dashboard/alert-list"

const statIcons = [Clock01Icon, Tag01Icon, ArrowDataTransferHorizontalIcon, AnalyticsUpIcon]

export function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {managerStats.map((stat, index) => (
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
          <ShiftList rows={managerToday} />
        </SectionCard>
        <SectionCard
          title="Needs attention"
          action={
            <LinkButton href="/overtime" variant="ghost" size="sm">
              Review
            </LinkButton>
          }
        >
          <AlertList alerts={managerAlerts} />
        </SectionCard>
      </div>
    </div>
  )
}
