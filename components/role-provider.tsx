"use client"

import * as React from "react"

import type { Role } from "@/lib/roles"
import { usePersistentRole } from "@/hooks/use-persistent-role"

type RoleContextValue = {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = React.createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = usePersistentRole()
  const value = React.useMemo(() => ({ role, setRole }), [role, setRole])

  return <RoleContext value={value}>{children}</RoleContext>
}

export function useRole() {
  const context = React.useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
