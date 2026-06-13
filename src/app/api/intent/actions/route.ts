import { created, getRequestContextMeta, handleApiError, parseJsonBody } from "@/lib/api/response"
import { logUserActionSchema } from "@/lib/api/schemas"
import { logUserAction } from "@/lib/intent/action-logger"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "intent:write")
    const body = await parseJsonBody(request, logUserActionSchema)

    const event = await logUserAction({
      residentId: body.residentId,
      eventType: body.eventType,
      eventName: body.eventName,
      pagePath: body.pagePath,
      content: body.content,
      targetType: body.targetType,
      targetId: body.targetId,
      metadata: body.metadata,
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "INTENT_ANALYSIS",
      action: "LOG_USER_ACTION",
      resourceType: "UserActionEvent",
      resourceId: event?.id,
      result: event ? "SUCCESS" : "FAILED",
      metadata: {
        eventType: event?.eventType ?? body.eventType,
        targetType: event?.targetType ?? body.targetType,
        skipped: !event,
      },
    })

    return created({ event })
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "INTENT_ANALYSIS",
      action: "LOG_USER_ACTION",
      resourceType: "UserActionEvent",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "action_log_failed", "行为记录失败")
  }
}
