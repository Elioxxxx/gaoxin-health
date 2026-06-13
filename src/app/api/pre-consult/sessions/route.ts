import {
  created,
  getRequestContextMeta,
  handleApiError,
  parseJsonBody,
} from "@/lib/api/response"
import { createPreConsultSessionSchema } from "@/lib/api/schemas"
import { createPreConsultSession } from "@/lib/pre-consult"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "pre-consult:write")
    const body = await parseJsonBody(request, createPreConsultSessionSchema)

    const session = await createPreConsultSession({
      residentId: body.residentId,
      initialInput: body.initialInput,
      scenarioKey: body.scenarioKey,
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "PRE_CONSULT",
      action: "CREATE_SESSION",
      resourceType: "PreConsultSession",
      resourceId: session.id,
      result: "SUCCESS",
      metadata: { scenarioKey: session.scenarioKey },
    })

    return created(session)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "PRE_CONSULT",
      action: "CREATE_SESSION",
      resourceType: "PreConsultSession",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "create_session_failed", "创建智能预问诊会话失败")
  }
}
