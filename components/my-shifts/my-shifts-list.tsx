"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon, StarIcon } from "@hugeicons/core-free-icons"

import type { StaffShift } from "@/lib/data/staff-shifts"
import { requestCoverage } from "@/app/(app)/my-shifts/actions"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"

export function MyShiftsList({ shifts }: { shifts: StaffShift[] }) {
  const router = useRouter()
  const [pending, setPending] = React.useState<string | null>(null)

  useRealtimeRefresh(["assignments", "swap_requests"], "my-shifts")

  async function request(shift: StaffShift, type: "drop" | "swap") {
    setPending(shift.assignmentId)
    const result = await requestCoverage(shift.shiftId, shift.assignmentId, type)
    setPending(null)
    if (result.ok) {
      toast.success(
        type === "drop" ? "Drop request sent for approval" : "Swap request sent for approval",
      )
      router.refresh()
    } else {
      toast.error(result.message ?? "Could not send the request.")
    }
  }

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
          key={shift.assignmentId}
          className="border-border/60 flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {shift.dayLabel} &middot; {shift.timeLabel}
              </span>
              {shift.premium ? (
                <HugeiconsIcon icon={StarIcon} className="text-muted-foreground size-3.5" />
              ) : null}
            </div>
            <span className="text-muted-foreground text-xs">
              {shift.location} &middot; {shift.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={pending === shift.assignmentId}
              onClick={() => request(shift, "drop")}
            >
              Drop
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending === shift.assignmentId}
              onClick={() => request(shift, "swap")}
            >
              Swap
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
