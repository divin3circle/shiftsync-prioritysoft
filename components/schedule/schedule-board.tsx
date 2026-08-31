"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import type { LocationSummary, SkillOption, WeekBoard } from "@/lib/data/schedule"
import { setWeekPublished } from "@/app/(app)/schedule/actions"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
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

export function ScheduleBoard({
  locations,
  skills,
  location,
  board,
  weekOffset,
  canManage,
}: {
  locations: LocationSummary[]
  skills: SkillOption[]
  location: LocationSummary
  board: WeekBoard
  weekOffset: number
  canManage: boolean
}) {
  const router = useRouter()
  const [publishing, startPublishing] = React.useTransition()

  useRealtimeRefresh(["shifts", "assignments"], "schedule-board")

  function go(next: { loc?: string; wk?: number }) {
    const loc = next.loc ?? location.id
    const wk = next.wk ?? weekOffset
    router.push(`/schedule?loc=${loc}&wk=${wk}`)
  }

  function togglePublished() {
    const next = !board.published
    startPublishing(async () => {
      await setWeekPublished(location.id, weekOffset, next)
      toast[next ? "success" : "message"](next ? "Week published" : "Week unpublished", {
        description: next
          ? "Staff can now see their shifts for this week."
          : "This week is hidden from staff again.",
      })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Select value={location.id} onValueChange={(value) => go({ loc: value as string })}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {(value) => locations.find((item) => item.id === value)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">{location.tzLabel}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous week"
            onClick={() => go({ wk: weekOffset - 1 })}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <span className="min-w-40 text-center text-sm font-medium">{board.rangeLabel}</span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next week"
            onClick={() => go({ wk: weekOffset + 1 })}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
          {weekOffset !== 0 ? (
            <Button variant="ghost" size="sm" onClick={() => go({ wk: 0 })}>
              This week
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={board.published ? "secondary" : "outline"}>
            {board.published ? "Published" : "Draft"}
          </Badge>
          {canManage ? (
            <>
              <Button
                variant={board.published ? "outline" : "default"}
                size="sm"
                disabled={publishing}
                onClick={togglePublished}
              >
                {board.published ? "Unpublish" : "Publish week"}
              </Button>
              <NewShiftDialog
                locations={locations}
                skills={skills}
                currentLocationId={location.id}
                weekOffset={weekOffset}
              />
            </>
          ) : (
            <Badge variant="outline">View only</Badge>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[52rem] grid-cols-7 gap-2">
          {board.days.map((day) => {
            const premiumDay = day.dayIndex === 4 || day.dayIndex === 5

            return (
              <div key={day.dayIndex} className="flex flex-col gap-2">
                <div
                  className={cn(
                    "flex items-baseline justify-between rounded-lg border px-2 py-1.5",
                    premiumDay && "bg-muted/50",
                  )}
                >
                  <span className="text-sm font-medium">{day.label}</span>
                  <span className="text-muted-foreground text-xs">{day.dateNumber}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {day.shifts.length > 0 ? (
                    day.shifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        canAssign={canManage}
                        skills={skills}
                      />
                    ))
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
