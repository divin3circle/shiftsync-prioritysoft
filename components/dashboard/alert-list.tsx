import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"

import type { DashboardAlert } from "@/lib/mock/dashboard"
import { cn } from "@/lib/utils"

export function AlertList({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <ul className="flex flex-col">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className="border-border/60 flex gap-3 border-b py-3 last:border-b-0"
        >
          <HugeiconsIcon
            icon={alert.tone === "warning" ? Alert02Icon : InformationCircleIcon}
            className={cn(
              "mt-0.5 size-4 shrink-0",
              alert.tone === "warning" ? "text-destructive" : "text-muted-foreground",
            )}
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{alert.title}</span>
            <span className="text-muted-foreground text-xs">{alert.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
