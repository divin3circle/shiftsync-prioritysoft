import { describe, expect, test } from "bun:test"

import { initials } from "@/lib/initials"
import { tzLabelFor, weekBounds } from "@/lib/data/schedule"
import { longestStreak } from "@/lib/data/staff-metrics"
import { mapNotification } from "@/lib/notification-item"

describe("helpers", () => {
  test("initials takes the first two words", () => {
    expect(initials("Sofia Alvarez")).toBe("SA")
    expect(initials("Dana")).toBe("D")
    expect(initials("James O'Brien")).toBe("JO")
  })

  test("timezone labels", () => {
    expect(tzLabelFor("America/Los_Angeles")).toBe("PT")
    expect(tzLabelFor("America/New_York")).toBe("ET")
    expect(tzLabelFor("UTC")).toBe("UTC")
  })

  test("longest streak of consecutive days", () => {
    expect(longestStreak(new Set())).toBe(0)
    expect(longestStreak(new Set(["2026-09-01"]))).toBe(1)
    expect(longestStreak(new Set(["2026-09-01", "2026-09-02", "2026-09-03"]))).toBe(3)
    expect(longestStreak(new Set(["2026-09-01", "2026-09-03", "2026-09-04"]))).toBe(2)
  })

  test("notification mapping", () => {
    const item = mapNotification({
      id: "1",
      title: "Hi",
      body: null,
      read: false,
      created_at: "2026-08-31T16:00:00Z",
    })
    expect(item.title).toBe("Hi")
    expect(item.body).toBe("")
    expect(item.read).toBe(false)
    expect(item.timeLabel).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} (AM|PM)$/)
  })

  test("week bounds span exactly seven days", () => {
    const { start, end } = weekBounds("America/Los_Angeles", 0)
    expect(Math.round(end.diff(start, "days").days)).toBe(7)
  })
})
