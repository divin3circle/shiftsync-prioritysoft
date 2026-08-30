"use client"

import * as React from "react"
import { toast } from "sonner"

import { weekDayNames } from "@/lib/mock/schedule"
import {
  recurringAvailability,
  availabilityExceptions,
  availabilityTimezone,
} from "@/lib/mock/availability"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionCard } from "@/components/common/section-card"

type DayState = { enabled: boolean; start: string; end: string }

function initialDays(): DayState[] {
  return weekDayNames.map((_, day) => {
    const window = recurringAvailability.find((item) => item.day === day)
    return window
      ? { enabled: true, start: window.start, end: window.end }
      : { enabled: false, start: "09:00", end: "17:00" }
  })
}

export function AvailabilityEditor() {
  const [days, setDays] = React.useState<DayState[]>(initialDays)

  function updateDay(day: number, patch: Partial<DayState>) {
    setDays((previous) => previous.map((state, index) => (index === day ? { ...state, ...patch } : state)))
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="Weekly availability"
        action={<Badge variant="outline">{availabilityTimezone}</Badge>}
      >
        <div className="flex flex-col">
          {days.map((state, day) => (
            <div
              key={day}
              className="border-border/60 flex items-center gap-4 border-b py-3 last:border-b-0"
            >
              <div className="flex w-28 items-center gap-3">
                <Switch
                  checked={state.enabled}
                  onCheckedChange={(checked) => updateDay(day, { enabled: checked })}
                />
                <span className="text-sm font-medium">{weekDayNames[day]}</span>
              </div>
              {state.enabled ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={state.start}
                    onChange={(event) => updateDay(day, { start: event.target.value })}
                    className="w-32"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    value={state.end}
                    onChange={(event) => updateDay(day, { end: event.target.value })}
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="One-off exceptions">
        <ul className="flex flex-col">
          {availabilityExceptions.map((exception) => (
            <li
              key={exception.id}
              className="border-border/60 flex items-center justify-between border-b py-3 last:border-b-0"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{exception.date}</span>
                <span className="text-muted-foreground text-xs">{exception.note}</span>
              </div>
              <Badge variant={exception.kind === "unavailable" ? "destructive" : "secondary"}>
                {exception.kind === "unavailable" ? "Unavailable" : "Available"}
              </Badge>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Availability saved")}>Save changes</Button>
      </div>
    </div>
  )
}
