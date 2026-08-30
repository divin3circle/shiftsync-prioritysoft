"use client"

import { useRole } from "@/components/role-provider"
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"

export function DashboardView() {
  const { role } = useRole()

  if (role === "staff") {
    return <StaffDashboard />
  }

  return <ManagerDashboard />
}
