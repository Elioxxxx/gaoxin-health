import { created, fail, getRouteParams, readJson, type RouteContext } from "@/lib/api/response"
import { submitDoctorFeedback } from "@/server/mutations/feedback-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  try {
    const { id } = await getRouteParams(context)
    const body = await readJson<{
      sessionId?: string
      runId?: string
      rating?: number
      comment?: string
      triageAccuracy?: string
      departmentAccuracy?: string
      summaryHelpful?: string
      needMoreInfo?: boolean
      actualResult?: string
      remark?: string
    }>(request)

    if (!body.sessionId) {
      return fail("validation_error", "缺少预问诊会话 ID", 422)
    }

    return created(
      await submitDoctorFeedback({
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
    )
  } catch (error) {
    if (error instanceof Error && error.message === "反馈内容不能为空") {
      return fail("validation_error", error.message, 422)
    }

    return fail(
      "feedback_failed",
      error instanceof Error ? error.message : "医生反馈提交失败",
      500
    )
  }
}
