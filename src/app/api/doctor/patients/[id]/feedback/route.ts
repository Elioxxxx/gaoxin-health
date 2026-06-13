import { doctorFeedbackSchema } from "@/lib/api/schemas"
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
import { submitDoctorFeedback } from "@/server/mutations/feedback-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "feedback:write")
    const body = await parseJsonBody(request, doctorFeedbackSchema)
    const feedback = await submitDoctorFeedback({
      doctorId: id,
      sessionId: body.sessionId,
      runId: body.runId,
      rating: body.rating,
      comment: body.comment,
      triageAccuracy: body.triageAccuracy,
      departmentAccuracy: body.departmentAccuracy,
      summaryHelpful: body.summaryHelpful,
      needMoreInfo: body.needMoreInfo,
      actualResult: body.actualResult,
      remark: body.remark,
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "DOCTOR_FEEDBACK",
      action: "CREATE_DOCTOR_FEEDBACK",
      resourceType: "AgentFeedback",
      resourceId: feedback.feedback.id,
      result: "SUCCESS",
      metadata: { doctorId: id, sessionId: body.sessionId },
    })

    return created(feedback)
  } catch (error) {
    if (error instanceof Error && error.message === "反馈内容不能为空") {
      return handleApiError(
        new ApiError("validation_error", error.message, 422),
        "feedback_failed",
        "医生反馈提交失败"
      )
    }

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "DOCTOR_FEEDBACK",
      action: "CREATE_DOCTOR_FEEDBACK",
      resourceType: "AgentFeedback",
      result: "FAILED",
      metadata: {
        doctorId: id,
        message: error instanceof Error ? error.message : "unknown",
      },
    })

    return handleApiError(error, "feedback_failed", "医生反馈提交失败")
  }
}
