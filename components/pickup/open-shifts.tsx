"use client"

import * as React from "react"
import { toast } from "sonner"
import { Tag01Icon } from "@hugeicons/core-free-icons"

import { scheduleByLocation } from "@/lib/mock/schedule"
import { demoLocations } from "@/lib/mock/locations"
import { demoStaff } from "@/lib/mock/staff"
import { demoUsers } from "@/lib/mock/users"
import { weekDayNames } from "@/lib/mock/schedule"
import { formatRange } from "@/lib/format"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const currentStaff = demoStaff.find((staff) => staff.name === demoUsers.staff.name) ?? demoStaff[0]

function locationName(id: string) {
  return demoLocations.find((item) => item.id === id)?.name ?? id
}

type OpenShift = {
  key: string
  location: string
  when: string
  role: string
  qualified: boolean
}

function collectOpenShifts(): OpenShift[] {
  const rows: OpenShift[] = []
  for (const [locationId, shifts] of Object.entries(scheduleByLocation)) {
    if (!currentStaff.locationIds.includes(locationId)) {
      continue
    }
    for (const shift of shifts) {
      if (shift.filled < shift.needed) {
        rows.push({
          key: `${locationId}-${shift.id}`,
          location: locationName(locationId),
          when: `${weekDayNames[shift.day]} ${formatRange(shift.start, shift.end)}`,
          role: shift.role,
          qualified: currentStaff.skills.includes(shift.role),
        })
      }
    }
  }
  return rows
}

export function OpenShifts() {
  const [shifts, setShifts] = React.useState<OpenShift[]>(collectOpenShifts)

  function claim(key: string) {
    setShifts((previous) => previous.filter((shift) => shift.key !== key))
    toast.success("Shift claimed, sent for approval")
  }

  if (shifts.length === 0) {
    return (
      <EmptyState
        icon={Tag01Icon}
        title="No open shifts"
        description="Open shifts at your locations will show up here."
      />
    )
  }

  return (
    <ul className="flex flex-col overflow-hidden rounded-xl border">
      {shifts.map((shift) => (
        <li
          key={shift.key}
          className="border-border/60 flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {shift.role} &middot; {shift.location}
            </span>
            <span className="text-muted-foreground text-xs">{shift.when}</span>
          </div>
          {shift.qualified ? (
            <Button size="sm" onClick={() => claim(shift.key)}>
              Claim
            </Button>
          ) : (
            <Badge variant="outline">Requires {shift.role}</Badge>
          )}
        </li>
      ))}
    </ul>
  )
}
