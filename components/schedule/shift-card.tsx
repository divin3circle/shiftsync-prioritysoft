import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

import type { BoardShift } from "@/lib/data/schedule"
import { cn } from "@/lib/utils"
import { AssignDialog } from "@/components/schedule/assign-dialog"

function CardBody({ shift }: { shift: BoardShift }) {
  return (
    <>
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium">
          {shift.startLabel} - {shift.endLabel}
        </span>
        {shift.premium ? (
          <HugeiconsIcon icon={StarIcon} className="text-muted-foreground size-3" />
        ) : null}
      </div>
      <div className="text-muted-foreground mt-0.5">{shift.requiredSkill}</div>
      <div className={cn("mt-1 truncate", shift.isOpen ? "text-destructive" : "font-medium")}>
        {shift.assignees.length > 0
          ? shift.assignees.map((assignee) => assignee.name).join(", ")
          : "Unfilled"}
      </div>
      {shift.headcount > 1 ? (
        <div className="text-muted-foreground mt-0.5">
          {shift.assignees.length}/{shift.headcount} filled
        </div>
      ) : null}
    </>
  )
}

export function ShiftCard({ shift, canAssign }: { shift: BoardShift; canAssign: boolean }) {
  const cardClass = cn(
    "w-full rounded-lg border p-2 text-left text-xs transition-colors",
    shift.isOpen && "border-destructive/40 border-dashed",
  )

  if (!shift.isOpen || !canAssign) {
    return (
      <div className={cardClass}>
        <CardBody shift={shift} />
      </div>
    )
  }

  return (
    <AssignDialog
      shiftId={shift.id}
      title={`${shift.requiredSkill} needed, ${shift.startLabel} - ${shift.endLabel}`}
      trigger={
        <button
          type="button"
          className={cn(
            cardClass,
            "hover:bg-muted focus-visible:ring-ring/40 outline-none focus-visible:ring-2",
          )}
        >
          <CardBody shift={shift} />
        </button>
      }
    />
  )
}
