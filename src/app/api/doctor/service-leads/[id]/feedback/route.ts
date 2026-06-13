import { created, fail, getRouteParams, readJson, type RouteContext } from "@/lib/api/response"
import {
  createServiceLeadFeedback,
  isServiceLeadStatus,
} from "@/server/mutations/service-lead-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  try {
    const { id } = await getRouteParams(context)
    const body = await readJson<{
      status?: string
      operatorRole?: string
      operatorName?: string
      feedbackType?: string
      comment?: string
    }>(request)

    if (body.status && !isServiceLeadStatus(body.status)) {
      return fail("validation_error", "不支持的线索状态", 422)
    }
    const status = body.status && isServiceLeadStatus(body.status) ? body.status : undefined

    const result = await createServiceLeadFeedback({
      serviceLeadId: id,
      status,
      operatorRole: body.operatorRole ?? "DOCTOR",
      operatorName: body.operatorName ?? "医生端演示账号",
      feedbackType: body.feedbackType ?? "DOCTOR_ACTION",
      comment: body.comment ?? "医生端更新服务线索状态。",
    })

    if (!result) {
      return fail("not_found", "服务线索不存在", 404)
    }

    return created(result)
  } catch (error) {
    return fail(
      "lead_feedback_failed",
      error instanceof Error ? error.message : "服务线索反馈失败",
      500
    )
  }
}
