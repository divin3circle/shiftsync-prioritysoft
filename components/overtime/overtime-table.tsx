import type { OvertimeStatus, StaffMetric } from "@/lib/data/staff-metrics"
import { limits } from "@/lib/scheduling/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusLabel: Record<OvertimeStatus, string> = {
  ok: "OK",
  approaching: "Approaching",
  overtime: "Overtime",
}

const statusVariant: Record<OvertimeStatus, "secondary" | "outline" | "destructive"> = {
  ok: "secondary",
  approaching: "outline",
  overtime: "destructive",
}

function HoursBar({ hours, status }: { hours: number; status: OvertimeStatus }) {
  const width = Math.min(hours / 40, 1) * 100
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-sm font-medium tabular-nums">{hours}h</span>
      <div className="bg-muted h-1.5 w-32 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full",
            status === "overtime" ? "bg-destructive" : "bg-foreground",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function OvertimeTable({ rows }: { rows: StaffMetric[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Weekly hours</TableHead>
            <TableHead className="hidden sm:table-cell">Consecutive days</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{row.name}</span>
                  {row.consecutiveDays >= limits.consecutiveOverrideDays ? (
                    <span className="text-muted-foreground text-xs">
                      Seventh consecutive day, needs an override
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <HoursBar hours={row.hours} status={row.status} />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span
                  className={cn(
                    "text-sm",
                    row.consecutiveDays >= limits.consecutiveOverrideDays
                      ? "text-destructive font-medium"
                      : row.consecutiveDays >= limits.consecutiveWarnDays
                        ? "font-medium"
                        : "text-muted-foreground",
                  )}
                >
                  {row.consecutiveDays} days
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
