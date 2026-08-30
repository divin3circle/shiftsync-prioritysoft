export type Role = "admin" | "manager" | "staff"

export const ROLES: Role[] = ["admin", "manager", "staff"]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Corporate oversight across every location",
  manager: "Runs the schedule for assigned locations",
  staff: "Works shifts and manages availability",
}
