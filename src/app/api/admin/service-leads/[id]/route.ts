import {
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  ok,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { updateServiceLeadSchema } from "@/lib/api/schemas"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { updateServiceLeadStatus } from "@/server/mutations/service-lead-mutation"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "service-lead:update")
    const { id } = await getRouteParams(context)
    const body = await parseJsonBody(request, updateServiceLeadSchema)

    const lead = await updateServiceLeadStatus(id, body.status)

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "SERVICE_LEAD",
      action: "UPDATE_SERVICE_LEAD_STATUS",
      resourceType: "ServiceLead",
      resourceId: id,
      result: "SUCCESS",
      metadata: { status: body.status },
    })

    return ok({ lead })
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "SERVICE_LEAD",
      action: "UPDATE_SERVICE_LEAD_STATUS",
      resourceType: "ServiceLead",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "service_lead_update_failed", "线索更新失败")
  }
}
