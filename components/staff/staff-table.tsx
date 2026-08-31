"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import type { RosterMember } from "@/lib/data/roster"
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

export function StaffTable({ members }: { members: RosterMember[] }) {
  const [query, setQuery] = React.useState("")
  const [locationFilter, setLocationFilter] = React.useState("all")
  const [selected, setSelected] = React.useState<RosterMember | null>(null)
  const [open, setOpen] = React.useState(false)

  const locationOptions = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const member of members) {
      for (const location of member.locations) seen.set(location.id, location.name)
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }))
  }, [members])

  const term = query.trim().toLowerCase()
  const filtered = members.filter((member) => {
    const matchesTerm =
      term === "" ||
      member.name.toLowerCase().includes(term) ||
      member.skills.some((skill) => skill.toLowerCase().includes(term))
    const matchesLocation =
      locationFilter === "all" || member.locations.some((location) => location.id === locationFilter)
    return matchesTerm && matchesLocation
  })

  function openMember(member: RosterMember) {
    setSelected(member)
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
                value === "all"
                  ? "All locations"
                  : (locationOptions.find((option) => option.id === value)?.name ?? "All locations")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locationOptions.map((location) => (
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
            {filtered.map((member) => (
              <TableRow key={member.id} onClick={() => openMember(member)} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {member.locations.map((location) => location.name).join(", ")}
                </TableCell>
                <TableCell className="text-right text-sm">{member.desiredHours}h</TableCell>
                <TableCell
                  className={cn(
                    "text-right text-sm font-medium",
                    member.weekHours >= 35 && "text-destructive",
                  )}
                >
                  {member.weekHours}h
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StaffDetailSheet member={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}
