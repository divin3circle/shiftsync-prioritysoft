"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { useRole } from "@/components/role-provider"
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function RoleSwitcher() {
  const { role, setRole } = useRole()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={UserCircleIcon} />
            <span className="text-muted-foreground hidden sm:inline">Viewing as</span>
            <span className="font-medium">{ROLE_LABELS[role]}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Preview role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ROLES.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => setRole(option)}
              className="flex-col items-start gap-0.5"
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium">{ROLE_LABELS[option]}</span>
                {option === role ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                ) : null}
              </div>
              <span className="text-muted-foreground text-xs">
                {ROLE_DESCRIPTIONS[option]}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
