import { DateTime } from "luxon"
import type { SupabaseClient } from "@supabase/supabase-js"

import { tzLabelFor } from "@/lib/data/schedule"

export type DashboardStat = {
  label: string
  value: string
  hint: string
  emphasis?: "warning"
}

export type ShiftRow = {
  id: string
  location: string
  when: string
  person?: string
  role: string
  status: "on" | "upcoming" | "open"
}

export type DashboardAlert = {
  id: string
  title: string
  detail: string
  tone: "warning" | "info"
}

type ManagerDashboard = {
  stats: DashboardStat[]
  today: ShiftRow[]
  alerts: DashboardAlert[]
}

type StaffDashboard = {
  stats: DashboardStat[]
  upcoming: ShiftRow[]
  activity: DashboardAlert[]
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value
  return (row as Record<string, unknown>) ?? null
}

function hoursBetween(startISO: string, endISO: string): number {
  return (new Date(endISO).getTime() - new Date(startISO).getTime()) / 3_600_000
}

function whenLabel(startISO: string, endISO: string, timezone: string): string {
  const start = DateTime.fromISO(startISO, { zone: "utc" }).setZone(timezone)
  const end = DateTime.fromISO(endISO, { zone: "utc" }).setZone(timezone)
  const fmt = (value: DateTime) => value.toFormat("h:mma").toLowerCase()
  return `${start.toFormat("EEE")} ${fmt(start)} - ${fmt(end)} ${tzLabelFor(timezone)}`
}

const weekWindow = () => {
  const start = DateTime.now().setZone("America/New_York").startOf("week")
  const end = DateTime.now().setZone("America/Los_Angeles").startOf("week").plus({ days: 7 })
  return { startISO: start.toUTC().toISO()!, endISO: end.toUTC().toISO()! }
}

export async function getManagerDashboard(supabase: SupabaseClient): Promise<ManagerDashboard> {
  const { startISO, endISO } = weekWindow()
  const nowMs = Date.now()

  const [{ data: shiftData }, { count: pending }] = await Promise.all([
    supabase
      .from("shifts")
      .select(
        "id, starts_at, ends_at, headcount, is_premium, skills(name), locations(name, timezone), assignments(status, staff:profiles!assignments_staff_id_fkey(id, full_name))",
      )
      .gte("starts_at", startISO)
      .lt("starts_at", endISO),
    supabase
      .from("swap_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending_manager", "pending_target"]),
  ])

  const shifts = shiftData ?? []
  const onDuty = new Set<string>()
  const hoursByStaff = new Map<string, { name: string; hours: number }>()
  let openCount = 0

  for (const shift of shifts) {
    const assignees = ((shift.assignments as { status: string; staff: unknown }[] | null) ?? [])
      .filter((assignment) => assignment.status === "active")
      .map((assignment) => one(assignment.staff))

    if (assignees.length < (shift.headcount as number)) openCount += 1

    const startMs = new Date(shift.starts_at as string).getTime()
    const endMs = new Date(shift.ends_at as string).getTime()
    const hours = hoursBetween(shift.starts_at as string, shift.ends_at as string)

    for (const person of assignees) {
      if (!person) continue
      const id = person.id as string
      if (startMs <= nowMs && nowMs <= endMs) onDuty.add(id)
      const entry = hoursByStaff.get(id) ?? { name: person.full_name as string, hours: 0 }
      entry.hours += hours
      hoursByStaff.set(id, entry)
    }
  }

  const overtime = [...hoursByStaff.values()].reduce(
    (total, staff) => total + Math.max(0, staff.hours - 40),
    0,
  )
  const nearingOvertime = [...hoursByStaff.values()]
    .filter((staff) => staff.hours >= 35)
    .sort((a, b) => b.hours - a.hours)

  const stats: DashboardStat[] = [
    { label: "On duty now", value: String(onDuty.size), hint: "across 4 locations" },
    { label: "Open shifts", value: String(openCount), hint: "unfilled this week" },
    { label: "Pending approvals", value: String(pending ?? 0), hint: "swaps and drops" },
    {
      label: "Weekly overtime",
      value: `${overtime.toFixed(1)}h`,
      hint: "over 40 hours",
      ...(overtime > 0 ? { emphasis: "warning" as const } : {}),
    },
  ]

  const today = shifts
    .filter((shift) => {
      const location = one(shift.locations)
      const tz = (location?.timezone as string) ?? "America/Los_Angeles"
      const local = DateTime.fromISO(shift.starts_at as string, { zone: "utc" }).setZone(tz)
      return local.hasSame(DateTime.now().setZone(tz), "day")
    })
    .sort(
      (a, b) =>
        new Date(a.starts_at as string).getTime() - new Date(b.starts_at as string).getTime(),
    )
    .slice(0, 6)
    .map((shift) => {
      const location = one(shift.locations)
      const skill = one(shift.skills)
      const tz = (location?.timezone as string) ?? "America/Los_Angeles"
      const assignees = ((shift.assignments as { status: string; staff: unknown }[] | null) ?? [])
        .filter((assignment) => assignment.status === "active")
        .map((assignment) => one(assignment.staff))
      const startMs = new Date(shift.starts_at as string).getTime()
      const endMs = new Date(shift.ends_at as string).getTime()
      const open = assignees.length < (shift.headcount as number)
      const status: ShiftRow["status"] =
        open && assignees.length === 0 ? "open" : startMs <= nowMs && nowMs <= endMs ? "on" : "upcoming"

      return {
        id: shift.id as string,
        location: (location?.name as string) ?? "",
        when: whenLabel(shift.starts_at as string, shift.ends_at as string, tz),
        person: (assignees[0]?.full_name as string) ?? undefined,
        role: (skill?.name as string) ?? "",
        status,
      }
    })

  const alerts: DashboardAlert[] = []
  for (const staff of nearingOvertime.slice(0, 2)) {
    alerts.push({
      id: `ot-${staff.name}`,
      title: `${staff.name} nearing overtime`,
      detail: `Booked ${staff.hours.toFixed(1)} hours this week.`,
      tone: "warning",
    })
  }
  if (openCount > 0) {
    alerts.push({
      id: "coverage",
      title: "Coverage gaps this week",
      detail: `${openCount} open ${openCount === 1 ? "shift" : "shifts"} still need staff.`,
      tone: "warning",
    })
  }
  if ((pending ?? 0) > 0) {
    alerts.push({
      id: "approvals",
      title: "Requests awaiting approval",
      detail: `${pending} swap or drop ${pending === 1 ? "request" : "requests"} to review.`,
      tone: "info",
    })
  }

  return { stats, today, alerts }
}

export async function getStaffDashboard(
  supabase: SupabaseClient,
  userId: string,
): Promise<StaffDashboard> {
  const nowMs = Date.now()

  const [{ data: profile }, { data: assignmentRows }, { count: pending }, { data: notifications }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, desired_hours").eq("id", userId).single(),
      supabase
        .from("assignments")
        .select("shifts(starts_at, ends_at, is_premium, skills(name), locations(name, timezone))")
        .eq("staff_id", userId)
        .eq("status", "active"),
      supabase
        .from("swap_requests")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", userId)
        .in("status", ["pending_manager", "pending_target"]),
      supabase
        .from("notifications")
        .select("id, title, body")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
    ])

  const shifts = (assignmentRows ?? [])
    .map((row) => {
      const shift = one(row.shifts)
      const location = one(shift?.locations)
      const skill = one(shift?.skills)
      const tz = (location?.timezone as string) ?? "America/Los_Angeles"
      const startISO = shift?.starts_at as string
      const endISO = shift?.ends_at as string
      return {
        startMs: new Date(startISO).getTime(),
        hours: hoursBetween(startISO, endISO),
        when: whenLabel(startISO, endISO, tz),
        location: (location?.name as string) ?? "",
        role: (skill?.name as string) ?? "",
        premium: (shift?.is_premium as boolean) ?? false,
      }
    })
    .sort((a, b) => a.startMs - b.startMs)

  const totalHours = shifts.reduce((total, shift) => total + shift.hours, 0)
  const desired = (profile?.desired_hours as number) ?? 40
  const next = shifts.find((shift) => shift.startMs >= nowMs) ?? shifts[0]
  const upcomingShifts = shifts.filter((shift) => shift.startMs >= nowMs)

  const stats: DashboardStat[] = [
    {
      label: "Next shift",
      value: next ? next.when.split(" ").slice(0, 2).join(" ") : "None",
      hint: next ? `${next.location}, ${next.role}` : "Nothing booked",
    },
    {
      label: "Hours this week",
      value: `${Math.round(totalHours)} / ${desired}`,
      hint: `${shifts.length} ${shifts.length === 1 ? "shift" : "shifts"} booked`,
    },
    { label: "Pending requests", value: String(pending ?? 0), hint: "awaiting approval" },
    {
      label: "Upcoming shifts",
      value: String(upcomingShifts.length),
      hint: "still to work",
    },
  ]

  const upcoming: ShiftRow[] = upcomingShifts.slice(0, 4).map((shift, index) => ({
    id: `up-${index}`,
    location: shift.location,
    when: shift.when,
    role: shift.role,
    status: "upcoming",
  }))

  const activity: DashboardAlert[] = (notifications ?? []).map((note) => ({
    id: note.id as string,
    title: note.title as string,
    detail: (note.body as string) ?? "",
    tone: "info",
  }))

  return { stats, upcoming, activity }
}
