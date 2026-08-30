"use client"

import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon, StarIcon } from "@hugeicons/core-free-icons"

import { demoStaff } from "@/lib/mock/staff"
import { demoUsers } from "@/lib/mock/users"
import { demoLocations } from "@/lib/mock/locations"
import { weekDayNames } from "@/lib/mock/schedule"
import { shiftsForName } from "@/lib/schedule-utils"
import { formatRange } from "@/lib/format"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"

const currentStaff = demoStaff.find((staff) => staff.name === demoUsers.staff.name) ?? demoStaff[0]

function locationName(id: string) {
  return demoLocations.find((item) => item.id === id)?.name ?? id
}

export function MyShiftsList() {
  const shifts = shiftsForName(currentStaff.name)

  if (shifts.length === 0) {
    return (
      <EmptyState
        icon={Calendar02Icon}
        title="No shifts this week"
        description="Shifts assigned to you will appear here."
      />
    )
  }

  return (
    <ul className="flex flex-col overflow-hidden rounded-xl border">
      {shifts.map((shift) => (
        <li
          key={`${shift.locationId}-${shift.id}`}
          className="border-border/60 flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {weekDayNames[shift.day]} &middot; {formatRange(shift.start, shift.end)}
              </span>
              {shift.premium ? (
                <HugeiconsIcon icon={StarIcon} className="text-muted-foreground size-3.5" />
              ) : null}
            </div>
            <span className="text-muted-foreground text-xs">
              {locationName(shift.locationId)} &middot; {shift.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.success("Drop request sent for approval")}
            >
              Drop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Swap request started")}
            >
              Swap
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
