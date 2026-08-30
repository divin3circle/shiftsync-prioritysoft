import type { SchedulingStatus } from "@/lib/mock/fairness"
import { fairnessRows, fairnessSummary } from "@/lib/mock/fairness"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SectionCard } from "@/components/common/section-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const schedulingLabel: Record<SchedulingStatus, string> = {
  under: "Under desired",
  on_target: "On target",
  over: "Over desired",
}

const schedulingVariant: Record<SchedulingStatus, "secondary" | "outline"> = {
  under: "outline",
  on_target: "secondary",
  over: "outline",
}

export function FairnessView() {
  const maxPremium = Math.max(...fairnessRows.map((row) => row.premiumShifts))

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-2 p-5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Premium shift fairness</span>
          <Badge variant="outline">{fairnessSummary.period}</Badge>
        </div>
        <span className="text-2xl font-semibold tracking-tight">{fairnessSummary.score}</span>
        <p className="text-muted-foreground max-w-2xl text-sm">{fairnessSummary.detail}</p>
      </Card>

      <SectionCard title="Premium shifts by staff">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Premium shifts</TableHead>
              <TableHead className="text-right">Scheduling</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fairnessRows.map((row) => {
              const none = row.premiumShifts === 0
              return (
                <TableRow key={row.name}>
                  <TableCell>
                    <span className={cn("font-medium", none && "text-destructive")}>
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-sm tabular-nums">{row.premiumShifts}</span>
                      <div className="bg-muted h-1.5 w-40 overflow-hidden rounded-full">
                        <div
                          className={cn("h-full rounded-full", none ? "bg-destructive" : "bg-foreground")}
                          style={{ width: `${(row.premiumShifts / maxPremium) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={schedulingVariant[row.scheduling]}>
                      {schedulingLabel[row.scheduling]}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  )
}
