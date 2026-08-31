"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { Availability, DayWindow } from "@/lib/data/availability"
import { saveAvailability } from "@/app/(app)/availability/actions"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionCard } from "@/components/common/section-card"

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function AvailabilityEditor({ availability }: { availability: Availability }) {
  const router = useRouter()
  const [days, setDays] = React.useState<DayWindow[]>(availability.days)
  const [saving, setSaving] = React.useState(false)

  function updateDay(day: number, patch: Partial<DayWindow>) {
    setDays((previous) => previous.map((state, index) => (index === day ? { ...state, ...patch } : state)))
  }

  async function save() {
    setSaving(true)
    const result = await saveAvailability(days)
    setSaving(false)
    if (result.ok) {
      toast.success("Availability saved")
      router.refresh()
    } else {
      toast.error(result.message ?? "Could not save availability.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="Weekly availability"
        action={<Badge variant="outline">{availability.timezone}</Badge>}
      >
        <div className="flex flex-col">
          {days.map((state, day) => (
            <div
              key={day}
              className="border-border/60 flex items-center gap-4 border-b py-3 last:border-b-0"
            >
              <div className="flex w-28 items-center gap-3">
                <Switch
                  checked={state.enabled}
                  onCheckedChange={(checked) => updateDay(day, { enabled: checked })}
                />
                <span className="text-sm font-medium">{dayNames[day]}</span>
              </div>
              {state.enabled ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={state.start}
                    onChange={(event) => updateDay(day, { start: event.target.value })}
                    className="w-32"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    value={state.end}
                    onChange={(event) => updateDay(day, { end: event.target.value })}
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="One-off exceptions">
        {availability.exceptions.length > 0 ? (
          <ul className="flex flex-col">
            {availability.exceptions.map((exception) => (
              <li
                key={exception.id}
                className="border-border/60 flex items-center justify-between border-b py-3 last:border-b-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{exception.date}</span>
                  <span className="text-muted-foreground text-xs">{exception.note}</span>
                </div>
                <Badge variant={exception.kind === "unavailable" ? "destructive" : "secondary"}>
                  {exception.kind === "unavailable" ? "Unavailable" : "Available"}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No exceptions set.</p>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
