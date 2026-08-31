import { File01Icon } from "@hugeicons/core-free-icons"

import type { AuditEntry } from "@/lib/data/audit"
import { EmptyState } from "@/components/common/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={File01Icon}
        title="No changes logged yet"
        description="Every schedule change will be recorded here automatically."
      />
    )
  }

  return (
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
          {entries.map((entry) => (
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
                {entry.change || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
