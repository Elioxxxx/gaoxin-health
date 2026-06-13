import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"
import { redactSensitiveObject } from "@/lib/security/privacy"

import type { RequestContextMeta } from "@/lib/api/response"
import type { AuthContext } from "./auth-context"

export type AuditResult = "SUCCESS" | "FAILED" | "DENIED"

export type AuditLogInput = {
  auth: AuthContext
  request: RequestContextMeta
  purpose: string
  action: string
  resourceType: string
  resourceId?: string
  result: AuditResult
  metadata?: Record<string, unknown>
}

export async function writeAuditLog(input: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      requestId: input.request.requestId,
      traceId: input.request.traceId,
      actorId: input.auth.actorId,
      actorRole: input.auth.role,
      purpose: input.purpose,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      result: input.result,
      metadataJson: input.metadata ? stringifyJson(redactSensitiveObject(input.metadata)) : undefined,
      ipAddress: input.request.ipAddress,
      userAgent: input.request.userAgent,
    },
  })
}

export async function safeAuditLog(input: AuditLogInput) {
  try {
    await writeAuditLog(input)
  } catch (error) {
    console.error("audit_log_failed", error)
  }
}
