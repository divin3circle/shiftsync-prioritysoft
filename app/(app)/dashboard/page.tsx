import { PageHeader } from "@/components/common/page-header"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Your day at a glance across Coastal Eats." />
      <DashboardView />
    </div>
  )
}
