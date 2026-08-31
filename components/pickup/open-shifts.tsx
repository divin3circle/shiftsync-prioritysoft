"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tag01Icon } from "@hugeicons/core-free-icons"

import type { OpenShift } from "@/lib/data/staff-shifts"
import { claimOpenShift } from "@/app/(app)/pickup/actions"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function OpenShifts({ shifts }: { shifts: OpenShift[] }) {
  const router = useRouter()
  const [pending, setPending] = React.useState<string | null>(null)

  useRealtimeRefresh(["shifts", "assignments"], "open-shifts")

  async function claim(shiftId: string) {
    setPending(shiftId)
    const result = await claimOpenShift(shiftId)
    setPending(null)
    if (result.status === "claimed") {
      toast.success("Shift claimed, added to your schedule")
      router.refresh()
    } else {
      toast.error(result.message)
    }
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
          key={shift.shiftId}
          className="border-border/60 flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {shift.role} &middot; {shift.location}
            </span>
            <span className="text-muted-foreground text-xs">{shift.whenLabel}</span>
          </div>
          {shift.canClaim ? (
            <Button size="sm" disabled={pending === shift.shiftId} onClick={() => claim(shift.shiftId)}>
              Claim
            </Button>
          ) : (
            <Badge variant="outline">{shift.reason}</Badge>
          )}
        </li>
      ))}
    </ul>
  )
}
