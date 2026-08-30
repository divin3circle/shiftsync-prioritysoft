import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

type StatCardProps = {
  label: string
  value: string
  hint?: string
  icon?: IconSvgElement
  emphasis?: "default" | "warning"
}

export function StatCard({ label, value, hint, icon, emphasis = "default" }: StatCardProps) {
  return (
    <Card className="gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        {icon ? <HugeiconsIcon icon={icon} className="text-muted-foreground size-4" /> : null}
      </div>
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight",
          emphasis === "warning" && "text-destructive",
        )}
      >
        {value}
      </span>
      {hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}
    </Card>
  )
}
