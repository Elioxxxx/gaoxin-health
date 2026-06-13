import { Role } from "@/generated/prisma/client"

export type AuthContext = {
  actorId: string
  role: Role | "SYSTEM"
  displayName: string
  organizationId?: string
  isMock: boolean
}

export function getAuthContext(request?: Request): AuthContext {
  const headerRole = request?.headers.get("x-demo-role")?.toUpperCase()
  const role =
    headerRole === Role.RESIDENT || headerRole === Role.DOCTOR || headerRole === Role.ADMIN
      ? headerRole
      : "SYSTEM"

  return {
    actorId: request?.headers.get("x-demo-actor-id") ?? `mock-${role.toLowerCase()}`,
    role,
    displayName: request?.headers.get("x-demo-actor-name") ?? "演示用户",
    organizationId: request?.headers.get("x-demo-organization-id") ?? undefined,
    isMock: true,
  }
}
