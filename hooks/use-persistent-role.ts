import * as React from "react"

import type { Role } from "@/lib/roles"

const storageKey = "coastaleats:role"
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot(): Role {
  return (window.localStorage.getItem(storageKey) as Role | null) ?? "manager"
}

function getServerSnapshot(): Role {
  return "manager"
}

export function usePersistentRole(): [Role, (role: Role) => void] {
  const role = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setRole = React.useCallback((next: Role) => {
    window.localStorage.setItem(storageKey, next)
    listeners.forEach((listener) => listener())
  }, [])

  return [role, setRole]
}
