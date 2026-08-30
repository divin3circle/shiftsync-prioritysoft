export type RuleCode =
  | "overlap"
  | "rest"
  | "skill"
  | "certification"
  | "availability"
  | "daily_hours"
  | "weekly_hours"
  | "consecutive_days"

export type Severity = "block" | "warn"

export type Violation = {
  rule: RuleCode
  severity: Severity
  message: string
}

export type ProposedShift = {
  locationId: string
  requiredSkill: string
  start: Date
  end: Date
}

export type ExistingShift = {
  locationId: string
  start: Date
  end: Date
}

export type RecurringWindow = {
  weekday: number
  start: string
  end: string
}

export type StaffContext = {
  skills: string[]
  certifiedLocationIds: string[]
  availability: RecurringWindow[]
  availabilityZone: string
  existingShifts: ExistingShift[]
  overrideSeventhDay?: boolean
}

export type CheckResult = {
  ok: boolean
  violations: Violation[]
}

export type Candidate = {
  id: string
  name: string
  context: StaffContext
}

export type Suggestion = {
  id: string
  name: string
  warnings: Violation[]
}

export const limits = {
  minRestHours: 10,
  dailyWarnHours: 8,
  dailyBlockHours: 12,
  weeklyWarnHours: 35,
  weeklyLimitHours: 40,
  consecutiveWarnDays: 6,
  consecutiveOverrideDays: 7,
} as const
