"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { demoStaff, type DemoStaff } from "@/lib/mock/staff"
import { demoLocations } from "@/lib/mock/locations"
import { weeklyHoursByName } from "@/lib/schedule-utils"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StaffDetailSheet } from "@/components/staff/staff-detail-sheet"

function locationName(id: string) {
  return demoLocations.find((item) => item.id === id)?.name ?? id
}

export function StaffTable() {
  const [query, setQuery] = React.useState("")
  const [locationFilter, setLocationFilter] = React.useState("all")
  const [selected, setSelected] = React.useState<DemoStaff | null>(null)
  const [open, setOpen] = React.useState(false)

  const term = query.trim().toLowerCase()
  const filtered = demoStaff.filter((staff) => {
    const matchesTerm =
      term === "" ||
      staff.name.toLowerCase().includes(term) ||
      staff.skills.some((skill) => skill.toLowerCase().includes(term))
    const matchesLocation = locationFilter === "all" || staff.locationIds.includes(locationFilter)
    return matchesTerm && matchesLocation
  })

  function openStaff(staff: DemoStaff) {
    setSelected(staff)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or skill"
            className="pl-9"
          />
        </div>
        <Select value={locationFilter} onValueChange={(value) => setLocationFilter(value as string)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue>
              {(value) =>
                value === "all" ? "All locations" : locationName(value as string)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {demoLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead className="hidden md:table-cell">Skills</TableHead>
              <TableHead className="hidden lg:table-cell">Locations</TableHead>
              <TableHead className="text-right">Desired</TableHead>
              <TableHead className="text-right">This week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((staff) => {
              const hours = weeklyHoursByName(staff.name)
              return (
                <TableRow
                  key={staff.id}
                  onClick={() => openStaff(staff)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{staff.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {staff.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                    {staff.locationIds.map(locationName).join(", ")}
                  </TableCell>
                  <TableCell className="text-right text-sm">{staff.desiredHours}h</TableCell>
                  <TableCell
                    className={cn(
                      "text-right text-sm font-medium",
                      hours >= 35 && "text-destructive",
                    )}
                  >
                    {hours}h
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <StaffDetailSheet staff={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}
