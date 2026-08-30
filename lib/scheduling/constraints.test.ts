import { describe, expect, test } from "bun:test"
import { DateTime } from "luxon"

import { checkAssignment, suggestAlternatives } from "./constraints"
import type { CheckResult, ProposedShift, StaffContext } from "./types"

const zone = "America/Los_Angeles"

function at(iso: string): Date {
  return DateTime.fromISO(iso, { zone }).toJSDate()
}

function allDayAvailability() {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, start: "00:00", end: "24:00" }))
}

function baseContext(overrides: Partial<StaffContext> = {}): StaffContext {
  return {
    skills: ["Bartender", "Server"],
    certifiedLocationIds: ["harbor", "pier"],
    availability: [{ weekday: 5, start: "16:00", end: "24:00" }],
    availabilityZone: zone,
    existingShifts: [],
    overrideSeventhDay: false,
    ...overrides,
  }
}

function baseProposal(overrides: Partial<ProposedShift> = {}): ProposedShift {
  return {
    locationId: "harbor",
    requiredSkill: "Bartender",
    start: at("2026-09-04T16:00"),
    end: at("2026-09-04T23:00"),
    ...overrides,
  }
}

function rulesOf(result: CheckResult) {
  return result.violations.map((violation) => violation.rule)
}

describe("checkAssignment", () => {
  test("accepts a fully valid assignment", () => {
    const result = checkAssignment(baseProposal(), baseContext())
    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  test("blocks when the staff member lacks the required skill", () => {
    const result = checkAssignment(baseProposal({ requiredSkill: "Line cook" }), baseContext())
    expect(result.ok).toBe(false)
    expect(rulesOf(result)).toContain("skill")
  })

  test("blocks when the staff member is not certified for the location", () => {
    const result = checkAssignment(baseProposal({ locationId: "lighthouse" }), baseContext())
    expect(result.ok).toBe(false)
    expect(rulesOf(result)).toContain("certification")
  })

  test("blocks a double-booking even at a different location", () => {
    const context = baseContext({
      existingShifts: [
        { locationId: "pier", start: at("2026-09-04T20:00"), end: at("2026-09-04T23:00") },
      ],
    })
    const result = checkAssignment(baseProposal(), context)
    expect(result.ok).toBe(false)
    expect(rulesOf(result)).toContain("overlap")
  })

  test("blocks when there is less than ten hours of rest before the shift", () => {
    const context = baseContext({
      existingShifts: [
        { locationId: "harbor", start: at("2026-09-03T22:00"), end: at("2026-09-04T08:00") },
      ],
    })
    const result = checkAssignment(baseProposal(), context)
    expect(result.ok).toBe(false)
    expect(rulesOf(result)).toContain("rest")
  })

  test("allows exactly ten hours of rest", () => {
    const context = baseContext({
      existingShifts: [
        { locationId: "harbor", start: at("2026-09-04T00:00"), end: at("2026-09-04T06:00") },
      ],
    })
    const result = checkAssignment(baseProposal(), context)
    expect(rulesOf(result)).not.toContain("rest")
  })

  test("blocks when the shift falls outside availability", () => {
    const result = checkAssignment(
      baseProposal({ start: at("2026-09-04T14:00"), end: at("2026-09-04T20:00") }),
      baseContext(),
    )
    expect(result.ok).toBe(false)
    expect(rulesOf(result)).toContain("availability")
  })

  test("warns when daily hours exceed eight", () => {
    const context = baseContext({
      existingShifts: [
        { locationId: "harbor", start: at("2026-09-04T00:00"), end: at("2026-09-04T04:00") },
      ],
    })
    const result = checkAssignment(baseProposal(), context)
    const daily = result.violations.find((violation) => violation.rule === "daily_hours")
    expect(daily?.severity).toBe("warn")
  })

  test("blocks when daily hours exceed twelve", () => {
    const context = baseContext({
      existingShifts: [
        { locationId: "harbor", start: at("2026-09-04T00:00"), end: at("2026-09-04T06:00") },
      ],
    })
    const result = checkAssignment(baseProposal(), context)
    const daily = result.violations.find((violation) => violation.rule === "daily_hours")
    expect(daily?.severity).toBe("block")
    expect(result.ok).toBe(false)
  })

  test("warns when weekly hours reach thirty-five", () => {
    const context = baseContext({
      existingShifts: ["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03"].map((date) => ({
        locationId: "harbor",
        start: at(`${date}T09:00`),
        end: at(`${date}T17:00`),
      })),
    })
    const result = checkAssignment(baseProposal(), context)
    const weekly = result.violations.find((violation) => violation.rule === "weekly_hours")
    expect(weekly?.severity).toBe("warn")
  })

  test("warns on a sixth consecutive day", () => {
    const context = baseContext({
      availability: allDayAvailability(),
      existingShifts: ["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"].map(
        (date) => ({
          locationId: "harbor",
          start: at(`${date}T11:00`),
          end: at(`${date}T15:00`),
        }),
      ),
    })
    const result = checkAssignment(
      baseProposal({ start: at("2026-09-05T16:00"), end: at("2026-09-05T23:00") }),
      context,
    )
    const consecutive = result.violations.find((violation) => violation.rule === "consecutive_days")
    expect(consecutive?.severity).toBe("warn")
  })

  test("blocks a seventh consecutive day without an override", () => {
    const context = baseContext({
      availability: allDayAvailability(),
      existingShifts: [
        "2026-08-30",
        "2026-08-31",
        "2026-09-01",
        "2026-09-02",
        "2026-09-03",
        "2026-09-04",
      ].map((date) => ({
        locationId: "harbor",
        start: at(`${date}T11:00`),
        end: at(`${date}T15:00`),
      })),
    })
    const result = checkAssignment(
      baseProposal({ start: at("2026-09-05T16:00"), end: at("2026-09-05T23:00") }),
      context,
    )
    const consecutive = result.violations.find((violation) => violation.rule === "consecutive_days")
    expect(consecutive?.severity).toBe("block")
    expect(result.ok).toBe(false)
  })

  test("allows a seventh consecutive day when overridden", () => {
    const context = baseContext({
      availability: allDayAvailability(),
      overrideSeventhDay: true,
      existingShifts: [
        "2026-08-30",
        "2026-08-31",
        "2026-09-01",
        "2026-09-02",
        "2026-09-03",
        "2026-09-04",
      ].map((date) => ({
        locationId: "harbor",
        start: at(`${date}T11:00`),
        end: at(`${date}T15:00`),
      })),
    })
    const result = checkAssignment(
      baseProposal({ start: at("2026-09-05T16:00"), end: at("2026-09-05T23:00") }),
      context,
    )
    expect(result.ok).toBe(true)
  })
})

describe("suggestAlternatives", () => {
  test("returns only staff who can take the shift, ordered by fewest warnings", () => {
    const proposal = baseProposal()
    const candidates = [
      { id: "unskilled", name: "Unskilled", context: baseContext({ skills: ["Host"] }) },
      {
        id: "unavailable",
        name: "Unavailable",
        context: baseContext({ availability: [{ weekday: 1, start: "09:00", end: "17:00" }] }),
      },
      {
        id: "warned",
        name: "Warned",
        context: baseContext({
          existingShifts: [
            { locationId: "harbor", start: at("2026-09-04T00:00"), end: at("2026-09-04T04:00") },
          ],
        }),
      },
      { id: "clean", name: "Clean", context: baseContext() },
    ]

    const suggestions = suggestAlternatives(proposal, candidates)

    expect(suggestions.map((suggestion) => suggestion.id)).toEqual(["clean", "warned"])
    expect(suggestions[0].warnings).toEqual([])
    expect(suggestions[1].warnings.length).toBeGreaterThan(0)
  })
})
