import type { OnDutyLocation } from "@/lib/data/on-duty"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OnDutyBoard({ locations }: { locations: OnDutyLocation[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {locations.map((location) => (
        <Card key={location.id}>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="relative flex size-2">
                {location.entries.length > 0 ? (
                  <span className="bg-foreground/40 absolute inline-flex size-full animate-ping rounded-full" />
                ) : null}
                <span className="bg-foreground relative inline-flex size-2 rounded-full" />
              </span>
              {location.name}
            </CardTitle>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Badge variant="outline">{location.tzLabel}</Badge>
              {location.entries.length} on now
            </div>
          </CardHeader>
          <CardContent>
            {location.entries.length > 0 ? (
              <ul className="flex flex-col">
                {location.entries.map((entry) => (
                  <li
                    key={`${entry.name}-${entry.since}`}
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
      ))}
    </div>
  )
}
