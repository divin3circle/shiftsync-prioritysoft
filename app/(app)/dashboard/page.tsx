import { getSessionUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getManagerDashboard, getStaffDashboard } from "@/lib/data/dashboard"
import { PageHeader } from "@/components/common/page-header"
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"

export default async function DashboardPage() {
  const user = await getSessionUser()
  const supabase = await createClient()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Your day at a glance across Coastal Eats." />
      {user?.role === "staff" ? (
        <StaffDashboard data={await getStaffDashboard(supabase, user.id)} />
      ) : (
        <ManagerDashboard data={await getManagerDashboard(supabase)} />
      )}
    </div>
  )
}
