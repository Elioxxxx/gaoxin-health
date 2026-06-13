import { MessageRole } from "@/generated/prisma/client"
import {
  created,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { createPreConsultMessageSchema } from "@/lib/api/schemas"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "pre-consult:write")
    const body = await parseJsonBody(request, createPreConsultMessageSchema)

    const message = await prisma.preConsultMessage.create({
      data: {
        sessionId: id,
        role: body.role === "ASSISTANT" ? MessageRole.ASSISTANT : MessageRole.USER,
        content: body.content,
        structuredJson: stringifyJson({ source: "api", requestId: requestMeta.requestId }),
      },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "PRE_CONSULT",
      action: "CREATE_MESSAGE",
      resourceType: "PreConsultSession",
      resourceId: id,
      result: "SUCCESS",
      metadata: { messageId: message.id, role: message.role },
    })

    return created(message)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "PRE_CONSULT",
      action: "CREATE_MESSAGE",
      resourceType: "PreConsultSession",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "create_message_failed", "写入预问诊消息失败")
  }
}
