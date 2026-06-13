import { Role } from "@/generated/prisma/client"
import { ApiError } from "@/lib/api/response"

import type { AuthContext } from "./auth-context"

export type Permission =
  | "pre-consult:write"
  | "intent:write"
  | "service-lead:update"
  | "admin:manage"

const rolePermissions: Record<AuthContext["role"], Permission[]> = {
  SYSTEM: ["pre-consult:write", "intent:write", "service-lead:update", "admin:manage"],
  [Role.RESIDENT]: ["pre-consult:write", "intent:write"],
  [Role.DOCTOR]: ["service-lead:update", "intent:write"],
  [Role.ADMIN]: ["service-lead:update", "admin:manage", "intent:write"],
}

export function requirePermission(auth: AuthContext, permission: Permission) {
  if (!rolePermissions[auth.role].includes(permission)) {
    throw new ApiError("forbidden", "当前角色无权执行该操作", 403)
  }
}
