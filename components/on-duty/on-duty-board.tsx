import { demoLocations } from "@/lib/mock/locations"
import { onDutyByLocation } from "@/lib/mock/on-duty"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function OnDutyBoard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {demoLocations.map((location) => {
        const entries = onDutyByLocation[location.id] ?? []
        return (
          <Card key={location.id}>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="relative flex size-2">
                  <span className="bg-foreground/40 absolute inline-flex size-full animate-ping rounded-full" />
                  <span className="bg-foreground relative inline-flex size-2 rounded-full" />
                </span>
                {location.name}
              </CardTitle>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Badge variant="outline">{location.timezoneLabel}</Badge>
                {entries.length} on now
              </div>
            </CardHeader>
            <CardContent>
              {entries.length > 0 ? (
                <ul className="flex flex-col">
                  {entries.map((entry) => (
                    <li
                      key={entry.name}
                      className="border-border/60 flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{entry.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{entry.name}</span>
                          <span className="text-muted-foreground text-xs">{entry.role}</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {entry.since} - {entry.until}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground py-2 text-sm">No one clocked in.</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
