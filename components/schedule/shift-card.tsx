import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

import type { ScheduleShift } from "@/lib/mock/schedule"
import { formatRange } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ShiftCard({ shift }: { shift: ScheduleShift }) {
  const unfilled = shift.filled < shift.needed

  return (
    <button
      type="button"
      className={cn(
        "hover:bg-muted focus-visible:ring-ring/40 w-full rounded-lg border p-2 text-left text-xs transition-colors outline-none focus-visible:ring-2",
        unfilled && "border-destructive/40 border-dashed",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium">{formatRange(shift.start, shift.end)}</span>
        {shift.premium ? (
          <HugeiconsIcon icon={StarIcon} className="text-muted-foreground size-3" />
        ) : null}
      </div>
      <div className="text-muted-foreground mt-0.5">{shift.role}</div>
      <div className={cn("mt-1 truncate", unfilled ? "text-destructive" : "font-medium")}>
        {shift.assignee ?? "Unfilled"}
      </div>
      {shift.needed > 1 ? (
        <div className="text-muted-foreground mt-0.5">
          {shift.filled}/{shift.needed} filled
        </div>
      ) : null}
    </button>
  )
}
