"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon } from "@hugeicons/core-free-icons"

import { auditEntries } from "@/lib/mock/audit"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ranges = ["This week", "Last 7 days", "Last 30 days"]

export function AuditLog() {
  const [range, setRange] = React.useState(ranges[0])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={range} onValueChange={(value) => setRange(value as string)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success(`Exported audit log (${range})`)}
        >
          <HugeiconsIcon icon={File01Icon} />
          Export
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Change</TableHead>
              <TableHead className="hidden lg:table-cell">Before and after</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {entry.time}
                </TableCell>
                <TableCell className="text-sm">{entry.actor}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{entry.action}</span>
                    <span className="text-muted-foreground text-xs">{entry.target}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {entry.change}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
