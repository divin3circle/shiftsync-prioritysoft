"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { demoLocations } from "@/lib/mock/locations"
import { scheduleByLocation, weekDayNames } from "@/lib/mock/schedule"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShiftCard } from "@/components/schedule/shift-card"
import { NewShiftDialog } from "@/components/schedule/new-shift-dialog"

function getWeekDates(offset: number): Date[] {
  const now = new Date()
  const daysSinceMonday = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - daysSinceMonday + offset * 7)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
}

function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ScheduleBoard() {
  const [locationId, setLocationId] = React.useState(demoLocations[0].id)
  const [weekOffset, setWeekOffset] = React.useState(0)
  const [published, setPublished] = React.useState(false)

  const weekDates = React.useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const location = demoLocations.find((item) => item.id === locationId) ?? demoLocations[0]
  const shifts = scheduleByLocation[locationId] ?? []

  function togglePublished() {
    const next = !published
    setPublished(next)
    toast[next ? "success" : "message"](next ? "Week published" : "Week unpublished", {
      description: next
        ? "Staff can now see their shifts for this week."
        : "This week is hidden from staff again.",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Select value={locationId} onValueChange={(value) => setLocationId(value as string)}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {(value) => demoLocations.find((item) => item.id === value)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {demoLocations.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">{location.timezoneLabel}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous week"
            onClick={() => setWeekOffset((value) => value - 1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <span className="min-w-40 text-center text-sm font-medium">
            {shortDate(weekDates[0])} - {shortDate(weekDates[6])}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next week"
            onClick={() => setWeekOffset((value) => value + 1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
          {weekOffset !== 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              This week
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={published ? "secondary" : "outline"}>
            {published ? "Published" : "Draft"}
          </Badge>
          <Button variant={published ? "outline" : "default"} size="sm" onClick={togglePublished}>
            {published ? "Unpublish" : "Publish week"}
          </Button>
          <NewShiftDialog locationName={location.name} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[52rem] grid-cols-7 gap-2">
          {weekDates.map((date, dayIndex) => {
            const dayShifts = shifts
              .filter((shift) => shift.day === dayIndex)
              .sort((a, b) => a.start.localeCompare(b.start))
            const premiumDay = dayIndex === 4 || dayIndex === 5

            return (
              <div key={dayIndex} className="flex flex-col gap-2">
                <div
                  className={cn(
                    "flex items-baseline justify-between rounded-lg border px-2 py-1.5",
                    premiumDay && "bg-muted/50",
                  )}
                >
                  <span className="text-sm font-medium">{weekDayNames[dayIndex]}</span>
                  <span className="text-muted-foreground text-xs">{date.getDate()}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {dayShifts.length > 0 ? (
                    dayShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
                  ) : (
                    <div className="text-muted-foreground/60 rounded-lg border border-dashed px-2 py-6 text-center text-xs">
                      No shifts
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
