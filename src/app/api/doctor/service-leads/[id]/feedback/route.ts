import { serviceLeadFeedbackSchema } from "@/lib/api/schemas"
import {
  ApiError,
  created,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { createServiceLeadFeedback } from "@/server/mutations/service-lead-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "service-lead:update")
    const body = await parseJsonBody(request, serviceLeadFeedbackSchema)

    const result = await createServiceLeadFeedback({
      serviceLeadId: id,
      status: body.status,
      operatorRole: body.operatorRole ?? "DOCTOR",
      operatorName: body.operatorName ?? "医生端演示账号",
      feedbackType: body.feedbackType ?? "DOCTOR_ACTION",
      comment: body.comment ?? "医生端更新服务线索状态。",
    })

    if (!result) {
      throw new ApiError("not_found", "服务线索不存在", 404)
    }

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "SERVICE_LEAD_FEEDBACK",
      action: "CREATE_SERVICE_LEAD_FEEDBACK",
      resourceType: "ServiceLead",
      resourceId: id,
      result: "SUCCESS",
      metadata: {
        status: body.status,
        feedbackType: body.feedbackType ?? "DOCTOR_ACTION",
      },
    })

    return created(result)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "SERVICE_LEAD_FEEDBACK",
      action: "CREATE_SERVICE_LEAD_FEEDBACK",
      resourceType: "ServiceLead",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "lead_feedback_failed", "服务线索反馈失败")
  }
}
