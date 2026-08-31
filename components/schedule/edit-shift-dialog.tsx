"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { BoardShift, SkillOption } from "@/lib/data/schedule"
import { updateShift, deleteShift } from "@/app/(app)/schedule/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EditShiftDialog({
  shift,
  skills,
  trigger,
}: {
  shift: BoardShift
  skills: SkillOption[]
  trigger: React.ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  const [skillId, setSkillId] = React.useState(shift.requiredSkillId)
  const [start, setStart] = React.useState(shift.startTime)
  const [end, setEnd] = React.useState(shift.endTime)
  const [headcount, setHeadcount] = React.useState(String(shift.headcount))

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const result = await updateShift(shift.id, {
      startTime: start,
      endTime: end,
      skillId,
      headcount: Number(headcount),
    })
    setPending(false)
    if (result.ok) {
      setOpen(false)
      toast.success("Shift updated")
      router.refresh()
    } else {
      toast.error(result.message ?? "Could not update the shift.")
    }
  }

  async function remove() {
    setPending(true)
    const result = await deleteShift(shift.id)
    setPending(false)
    if (result.ok) {
      setOpen(false)
      toast.success("Shift removed")
      router.refresh()
    } else {
      toast.error(result.message ?? "Could not remove the shift.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit shift</DialogTitle>
          <DialogDescription>
            {shift.assignees.map((assignee) => assignee.name).join(", ") || "Unfilled"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Role</Label>
            <Select value={skillId} onValueChange={(value) => setSkillId(value as string)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value) => skills.find((skill) => skill.id === value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-start">Start</Label>
              <Input id="edit-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-end">End</Label>
              <Input id="edit-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-headcount">Headcount</Label>
              <Input
                id="edit-headcount"
                type="number"
                min={1}
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-between gap-2">
            <Button type="button" variant="ghost" disabled={pending} onClick={remove}>
              Remove shift
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
