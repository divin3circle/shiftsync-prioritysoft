"use client"

import * as React from "react"

import type { Role } from "@/lib/roles"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  initials: string
}

const SessionContext = React.createContext<SessionUser | null>(null)

export function RoleProvider({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  return <SessionContext value={user}>{children}</SessionContext>
}

export function useSession() {
  const user = React.useContext(SessionContext)
  if (!user) {
    throw new Error("useSession must be used within a RoleProvider")
  }
  return user
}

export function useRole() {
  return { role: useSession().role }
}
