"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { getShiftCandidates, assignToShift, type Candidate } from "@/app/(app)/schedule/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const statusBadge = {
  ready: { label: "Ready", variant: "secondary" as const },
  warn: { label: "Needs override", variant: "outline" as const },
  blocked: { label: "Blocked", variant: "destructive" as const },
}

export function AssignDialog({
  shiftId,
  title,
  trigger,
}: {
  shiftId: string
  title: string
  trigger: React.ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [candidates, setCandidates] = React.useState<Candidate[] | null>(null)
  const [overrideId, setOverrideId] = React.useState<string | null>(null)
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setCandidates(null)
      setOverrideId(null)
      getShiftCandidates(shiftId).then(setCandidates)
    }
  }

  async function assign(id: string, confirmOverride: boolean) {
    setPendingId(id)
    const result = await assignToShift(shiftId, id, confirmOverride)
    setPendingId(null)

    if (result.status === "assigned") {
      toast.success("Shift assigned")
      setOpen(false)
      router.refresh()
      return
    }
    if (result.status === "needsOverride") {
      setOverrideId(id)
      return
    }
    if (result.status === "blocked") {
      toast.error(result.reasons[0]?.message ?? "This assignment is not allowed.")
      return
    }
    toast.error(result.message)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign shift</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-96 flex-col gap-1 overflow-y-auto">
          {candidates === null ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Checking who can work...</p>
          ) : candidates.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No one is on this location&apos;s roster yet.
            </p>
          ) : (
            candidates.map((candidate) => {
              const badge = statusBadge[candidate.status]
              const isOverriding = overrideId === candidate.id
              const pending = pendingId === candidate.id

              return (
                <div key={candidate.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{candidate.name}</span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    {candidate.status === "ready" ? (
                      <Button size="sm" disabled={pending} onClick={() => assign(candidate.id, false)}>
                        Assign
                      </Button>
                    ) : candidate.status === "warn" && !isOverriding ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOverrideId(candidate.id)}
                      >
                        Review
                      </Button>
                    ) : null}
                  </div>

                  {candidate.status === "blocked" ? (
                    <ul className="text-muted-foreground mt-2 flex flex-col gap-1 text-xs">
                      {candidate.blocking.map((violation) => (
                        <li key={violation.rule}>{violation.message}</li>
                      ))}
                    </ul>
                  ) : null}

                  {candidate.status === "warn" && isOverriding ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
                        {candidate.overridable.map((violation) => (
                          <li key={violation.rule}>{violation.message}</li>
                        ))}
                      </ul>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setOverrideId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" disabled={pending} onClick={() => assign(candidate.id, true)}>
                          Assign anyway
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
