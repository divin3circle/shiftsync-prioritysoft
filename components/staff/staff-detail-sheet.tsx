import type { RosterMember } from "@/lib/data/roster"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type StaffDetailSheetProps = {
  member: RosterMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StaffDetailSheet({ member, open, onOpenChange }: StaffDetailSheetProps) {
  const overDesired = member ? member.weekHours > member.desiredHours : false
  const certified = member ? member.locations.filter((location) => location.certified) : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {member ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <SheetTitle>{member.name}</SheetTitle>
                  <SheetDescription>{member.skills.join(", ")}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6">
              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-medium">Certified locations</h3>
                <div className="flex flex-wrap gap-1.5">
                  {certified.length > 0 ? (
                    certified.map((location) => (
                      <Badge key={location.id} variant="outline">
                        {location.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None yet</span>
                  )}
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-medium">Hours this week</h3>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-2xl font-semibold", overDesired && "text-destructive")}>
                    {member.weekHours}h
                  </span>
                  <span className="text-muted-foreground text-sm">
                    of {member.desiredHours}h desired
                  </span>
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-medium">Scheduled shifts</h3>
                {member.shifts.length > 0 ? (
                  <ul className="flex flex-col">
                    {member.shifts.map((shift) => (
                      <li
                        key={shift.id}
                        className="border-border/60 flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                      >
                        <span>
                          {shift.dayLabel} &middot; {shift.timeLabel}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {shift.location} &middot; {shift.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No shifts scheduled this week.</p>
                )}
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
