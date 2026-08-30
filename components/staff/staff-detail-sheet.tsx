import type { DemoStaff } from "@/lib/mock/staff"
import { demoLocations } from "@/lib/mock/locations"
import { weekDayNames } from "@/lib/mock/schedule"
import { shiftsForName, weeklyHoursByName } from "@/lib/schedule-utils"
import { formatRange } from "@/lib/format"
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

function locationName(id: string) {
  return demoLocations.find((item) => item.id === id)?.name ?? id
}

type StaffDetailSheetProps = {
  staff: DemoStaff | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StaffDetailSheet({ staff, open, onOpenChange }: StaffDetailSheetProps) {
  const scheduled = staff ? weeklyHoursByName(staff.name) : 0
  const shifts = staff ? shiftsForName(staff.name) : []
  const overDesired = staff ? scheduled > staff.desiredHours : false

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {staff ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{staff.initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <SheetTitle>{staff.name}</SheetTitle>
                  <SheetDescription>{staff.skills.join(", ")}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6">
              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-medium">Certified locations</h3>
                <div className="flex flex-wrap gap-1.5">
                  {staff.locationIds.map((id) => (
                    <Badge key={id} variant="outline">
                      {locationName(id)}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-medium">Hours this week</h3>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn("text-2xl font-semibold", overDesired && "text-destructive")}
                  >
                    {scheduled}h
                  </span>
                  <span className="text-muted-foreground text-sm">
                    of {staff.desiredHours}h desired
                  </span>
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-medium">Scheduled shifts</h3>
                {shifts.length > 0 ? (
                  <ul className="flex flex-col">
                    {shifts.map((shift) => (
                      <li
                        key={`${shift.locationId}-${shift.id}`}
                        className="border-border/60 flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                      >
                        <span>
                          {weekDayNames[shift.day]} &middot; {formatRange(shift.start, shift.end)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {locationName(shift.locationId)} &middot; {shift.role}
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
