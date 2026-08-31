"use client"

import * as React from "react"
import { toast } from "sonner"

import { useSession } from "@/components/role-provider"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ToggleRow = { id: string; label: string; description: string; enabled: boolean }

function useToggles(initial: ToggleRow[]) {
  const [rows, setRows] = React.useState(initial)
  const set = (id: string, enabled: boolean) =>
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, enabled } : row)))
  return [rows, set] as const
}

export function SettingsForm() {
  const user = useSession()
  const isManager = user.role !== "staff"

  const [categories, setCategory] = useToggles([
    { id: "shifts", label: "New shifts assigned", description: "When a shift is added to your schedule", enabled: true },
    { id: "swaps", label: "Swap request updates", description: "Accepted, declined, or approved swaps", enabled: true },
    { id: "published", label: "Schedule published", description: "When a week goes live", enabled: true },
    { id: "overtime", label: "Overtime warnings", description: "When staff approach overtime", enabled: isManager },
  ])

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notifications">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Delivery</Label>
            <Select defaultValue="In-app + email">
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-app only">In-app only</SelectItem>
                <SelectItem value="In-app + email">In-app + email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            {categories
              .filter((row) => row.id !== "overtime" || isManager)
              .map((row) => (
                <div
                  key={row.id}
                  className="border-border/60 flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{row.label}</span>
                    <span className="text-muted-foreground text-xs">{row.description}</span>
                  </div>
                  <Switch
                    checked={row.enabled}
                    onCheckedChange={(checked) => setCategory(row.id, checked)}
                  />
                </div>
              ))}
          </div>
        </div>
      </SectionCard>

      {isManager ? (
        <SectionCard title="Scheduling">
          <div className="flex flex-col gap-2">
            <Label>Edit cutoff before a shift</Label>
            <Select defaultValue="48 hours">
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24 hours">24 hours</SelectItem>
                <SelectItem value="48 hours">48 hours</SelectItem>
                <SelectItem value="72 hours">72 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              How close to a shift managers can still edit it.
            </p>
          </div>
        </SectionCard>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </div>
  )
}
