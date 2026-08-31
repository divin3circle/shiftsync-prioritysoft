import type { ShiftRow } from "@/lib/data/dashboard"
import { Badge } from "@/components/ui/badge"

const statusLabel: Record<ShiftRow["status"], string> = {
  on: "On shift",
  upcoming: "Upcoming",
  open: "Open",
}

const statusVariant: Record<ShiftRow["status"], "secondary" | "outline" | "destructive"> = {
  on: "secondary",
  upcoming: "outline",
  open: "destructive",
}

export function ShiftList({ rows }: { rows: ShiftRow[] }) {
  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const title = row.person ?? (row.status === "open" ? `${row.role} needed` : row.role)

        return (
          <li
            key={row.id}
            className="border-border/60 flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-muted-foreground text-xs">
                {row.location} &middot; {row.when}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {row.person ? (
                <span className="text-muted-foreground hidden text-xs sm:inline">{row.role}</span>
              ) : null}
              <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
