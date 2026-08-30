import { DateTime } from "luxon"

import {
  limits,
  type Candidate,
  type CheckResult,
  type ProposedShift,
  type StaffContext,
  type Suggestion,
  type Violation,
} from "./types"

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 3_600_000
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime()
}

function dayKey(date: Date, zone: string): string {
  return DateTime.fromJSDate(date).setZone(zone).toISODate() ?? ""
}

function weekKey(date: Date, zone: string): string {
  const local = DateTime.fromJSDate(date).setZone(zone)
  return `${local.weekYear}-W${local.weekNumber}`
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function isWithinAvailability(proposal: ProposedShift, context: StaffContext): boolean {
  const start = DateTime.fromJSDate(proposal.start).setZone(context.availabilityZone)
  const end = DateTime.fromJSDate(proposal.end).setZone(context.availabilityZone)
  const startMinutes = start.hour * 60 + start.minute
  const endMinutes = end.hour * 60 + end.minute

  const covers = (weekday: number, from: number, to: number) =>
    context.availability.some(
      (window) =>
        window.weekday === weekday &&
        toMinutes(window.start) <= from &&
        toMinutes(window.end) >= to,
    )

  if (start.hasSame(end, "day")) {
    return covers(start.weekday, startMinutes, endMinutes)
  }

  const startDayCovered = covers(start.weekday, startMinutes, 24 * 60)
  const endDayCovered = endMinutes === 0 || covers(end.weekday, 0, endMinutes)
  return startDayCovered && endDayCovered
}

function consecutiveDays(proposal: ProposedShift, context: StaffContext): number {
  const zone = context.availabilityZone
  const worked = new Set(context.existingShifts.map((shift) => dayKey(shift.start, zone)))
  const proposalDay = dayKey(proposal.start, zone)
  worked.add(proposalDay)

  let streak = 1
  let cursor = DateTime.fromISO(proposalDay, { zone: "utc" }).minus({ days: 1 })
  while (worked.has(cursor.toISODate() ?? "")) {
    streak += 1
    cursor = cursor.minus({ days: 1 })
  }
  cursor = DateTime.fromISO(proposalDay, { zone: "utc" }).plus({ days: 1 })
  while (worked.has(cursor.toISODate() ?? "")) {
    streak += 1
    cursor = cursor.plus({ days: 1 })
  }
  return streak
}

export function checkAssignment(proposal: ProposedShift, context: StaffContext): CheckResult {
  const violations: Violation[] = []
  const zone = context.availabilityZone

  if (!context.skills.includes(proposal.requiredSkill)) {
    violations.push({
      rule: "skill",
      severity: "block",
      message: `This shift needs a ${proposal.requiredSkill} and they are not trained for it.`,
    })
  }

  if (!context.certifiedLocationIds.includes(proposal.locationId)) {
    violations.push({
      rule: "certification",
      severity: "block",
      message: "They are not certified to work at this location.",
    })
  }

  const overlapping = context.existingShifts.some((shift) =>
    overlaps(proposal.start, proposal.end, shift.start, shift.end),
  )
  if (overlapping) {
    violations.push({
      rule: "overlap",
      severity: "block",
      message: "They are already booked for an overlapping shift.",
    })
  }

  const shortestRest = context.existingShifts.reduce((shortest, shift) => {
    if (overlaps(proposal.start, proposal.end, shift.start, shift.end)) {
      return shortest
    }
    const gap =
      shift.end.getTime() <= proposal.start.getTime()
        ? hoursBetween(shift.end, proposal.start)
        : hoursBetween(proposal.end, shift.start)
    return Math.min(shortest, gap)
  }, Number.POSITIVE_INFINITY)

  if (shortestRest < limits.minRestHours) {
    violations.push({
      rule: "rest",
      severity: "block",
      message: `They need at least ${limits.minRestHours} hours between shifts, and this leaves less.`,
    })
  }

  if (!isWithinAvailability(proposal, context)) {
    violations.push({
      rule: "availability",
      severity: "block",
      message: "This shift is outside the hours they said they can work.",
    })
  }

  const proposalHours = hoursBetween(proposal.start, proposal.end)
  const proposalDay = dayKey(proposal.start, zone)
  const dailyHours =
    proposalHours +
    context.existingShifts
      .filter((shift) => dayKey(shift.start, zone) === proposalDay)
      .reduce((total, shift) => total + hoursBetween(shift.start, shift.end), 0)

  if (dailyHours > limits.dailyBlockHours) {
    violations.push({
      rule: "daily_hours",
      severity: "block",
      message: `This puts them at ${dailyHours} hours in one day, over the ${limits.dailyBlockHours} hour limit.`,
    })
  } else if (dailyHours > limits.dailyWarnHours) {
    violations.push({
      rule: "daily_hours",
      severity: "warn",
      message: `This puts them at ${dailyHours} hours in one day.`,
    })
  }

  const proposalWeek = weekKey(proposal.start, zone)
  const weeklyHours =
    proposalHours +
    context.existingShifts
      .filter((shift) => weekKey(shift.start, zone) === proposalWeek)
      .reduce((total, shift) => total + hoursBetween(shift.start, shift.end), 0)

  if (weeklyHours >= limits.weeklyWarnHours) {
    const overLimit = weeklyHours > limits.weeklyLimitHours
    violations.push({
      rule: "weekly_hours",
      severity: "warn",
      message: overLimit
        ? `This puts them at ${weeklyHours} hours this week, into overtime.`
        : `This puts them at ${weeklyHours} hours this week, near the ${limits.weeklyLimitHours} hour limit.`,
    })
  }

  const streak = consecutiveDays(proposal, context)
  if (streak >= limits.consecutiveOverrideDays && !context.overrideSeventhDay) {
    violations.push({
      rule: "consecutive_days",
      severity: "block",
      message: `This is their ${streak}th day in a row and needs a documented override.`,
    })
  } else if (streak >= limits.consecutiveWarnDays && streak < limits.consecutiveOverrideDays) {
    violations.push({
      rule: "consecutive_days",
      severity: "warn",
      message: `This is their ${streak}th day in a row.`,
    })
  }

  return {
    ok: violations.every((violation) => violation.severity !== "block"),
    violations,
  }
}

export function suggestAlternatives(
  proposal: ProposedShift,
  candidates: Candidate[],
): Suggestion[] {
  return candidates
    .map((candidate) => ({ candidate, result: checkAssignment(proposal, candidate.context) }))
    .filter(({ result }) => result.ok)
    .map(({ candidate, result }) => ({
      id: candidate.id,
      name: candidate.name,
      warnings: result.violations,
    }))
    .sort((a, b) => a.warnings.length - b.warnings.length || a.name.localeCompare(b.name))
}
