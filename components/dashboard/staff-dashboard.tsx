import {
  Calendar02Icon,
  Time04Icon,
  ArrowDataTransferHorizontalIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"

import { staffStats, staffUpcoming, staffActivity } from "@/lib/mock/dashboard"
import { StatCard } from "@/components/common/stat-card"
import { SectionCard } from "@/components/common/section-card"
import { LinkButton } from "@/components/common/link-button"
import { ShiftList } from "@/components/dashboard/shift-list"
import { AlertList } from "@/components/dashboard/alert-list"

const statIcons = [Calendar02Icon, Time04Icon, ArrowDataTransferHorizontalIcon, Tag01Icon]

export function StaffDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {staffStats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} icon={statIcons[index]} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Your upcoming shifts"
          action={
            <LinkButton href="/my-shifts" variant="ghost" size="sm">
              View all
            </LinkButton>
          }
        >
          <ShiftList rows={staffUpcoming} />
        </SectionCard>
        <SectionCard
          title="Recent activity"
          action={
            <LinkButton href="/notifications" variant="ghost" size="sm">
              View all
            </LinkButton>
          }
        >
          <AlertList alerts={staffActivity} />
        </SectionCard>
      </div>
    </div>
  )
}
