import {
  DashboardSquare01Icon,
  Calendar03Icon,
  Calendar02Icon,
  UserMultipleIcon,
  Clock01Icon,
  Time04Icon,
  ArrowDataTransferHorizontalIcon,
  Tag01Icon,
  AnalyticsUpIcon,
  JusticeScale01Icon,
  File01Icon,
  Notification03Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import type { Role } from "@/lib/roles"

export type NavItem = {
  title: string
  href: string
  icon: IconSvgElement
  roles: Role[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

const everyone: Role[] = ["admin", "manager", "staff"]
const ops: Role[] = ["admin", "manager"]
const staffOnly: Role[] = ["staff"]

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon, roles: everyone },
      { title: "On duty", href: "/on-duty", icon: Clock01Icon, roles: ops },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { title: "Schedule", href: "/schedule", icon: Calendar03Icon, roles: ops },
      { title: "Staff", href: "/staff", icon: UserMultipleIcon, roles: ops },
      { title: "Overtime", href: "/overtime", icon: AnalyticsUpIcon, roles: ops },
      { title: "Fairness", href: "/fairness", icon: JusticeScale01Icon, roles: ops },
      { title: "Audit log", href: "/audit", icon: File01Icon, roles: ops },
    ],
  },
  {
    label: "My work",
    items: [
      { title: "My shifts", href: "/my-shifts", icon: Calendar02Icon, roles: staffOnly },
      { title: "Availability", href: "/availability", icon: Time04Icon, roles: staffOnly },
      { title: "Open shifts", href: "/pickup", icon: Tag01Icon, roles: staffOnly },
    ],
  },
  {
    label: "Requests",
    items: [
      {
        title: "Swaps & coverage",
        href: "/swaps",
        icon: ArrowDataTransferHorizontalIcon,
        roles: everyone,
      },
    ],
  },
]

export const secondaryNav: NavItem[] = [
  { title: "Notifications", href: "/notifications", icon: Notification03Icon, roles: everyone },
  { title: "Settings", href: "/settings", icon: Settings01Icon, roles: everyone },
]

export function groupsForRole(role: Role): NavGroup[] {
  return navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0)
}

export function secondaryForRole(role: Role): NavItem[] {
  return secondaryNav.filter((item) => item.roles.includes(role))
}

export function findNavTitle(pathname: string): string | undefined {
  const all = [...navGroups.flatMap((group) => group.items), ...secondaryNav]
  return all.find((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))?.title
}
