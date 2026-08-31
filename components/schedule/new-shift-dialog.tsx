"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import type { LocationSummary, SkillOption } from "@/lib/data/schedule"
import { createShift } from "@/app/(app)/schedule/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
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

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function NewShiftDialog({
  locations,
  skills,
  currentLocationId,
  weekOffset,
}: {
  locations: LocationSummary[]
  skills: SkillOption[]
  currentLocationId: string
  weekOffset: number
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const [locationId, setLocationId] = React.useState(currentLocationId)
  const [dayIndex, setDayIndex] = React.useState("4")
  const [skillId, setSkillId] = React.useState(skills[0]?.id ?? "")
  const [start, setStart] = React.useState("17:00")
  const [end, setEnd] = React.useState("23:00")
  const [headcount, setHeadcount] = React.useState("1")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const result = await createShift({
      locationId,
      weekOffset,
      dayIndex: Number(dayIndex),
      start,
      end,
      skillId,
      headcount: Number(headcount),
    })
    setSaving(false)
    if (result.ok) {
      setOpen(false)
      toast.success("Shift added to the draft", {
        description: "Assign staff, then publish the week to share it.",
      })
      router.refresh()
    } else {
      toast.error(result.message ?? "Could not add the shift.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <HugeiconsIcon icon={Add01Icon} />
            New shift
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New shift</DialogTitle>
          <DialogDescription>Add a shift to this week&apos;s draft.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Location</Label>
            <Select value={locationId} onValueChange={(value) => setLocationId(value as string)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value) => locations.find((item) => item.id === value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Day</Label>
              <Select value={dayIndex} onValueChange={(value) => setDayIndex(value as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(value) => dayNames[Number(value)]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={day} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start">Start</Label>
              <Input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end">End</Label>
              <Input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="headcount">Headcount</Label>
              <Input
                id="headcount"
                type="number"
                min={1}
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
