import type { Role } from "@/lib/roles"

export type DemoUser = {
  name: string
  email: string
  role: Role
  initials: string
  title: string
}

export const demoUsers: Record<Role, DemoUser> = {
  admin: {
    name: "Dana Whitfield",
    email: "admin@coastaleats.com",
    role: "admin",
    initials: "DW",
    title: "Operations Director",
  },
  manager: {
    name: "Marcus Lee",
    email: "manager@coastaleats.com",
    role: "manager",
    initials: "ML",
    title: "General Manager, Harbor & Pier",
  },
  staff: {
    name: "Sofia Alvarez",
    email: "staff@coastaleats.com",
    role: "staff",
    initials: "SA",
    title: "Bartender, Server",
  },
}
