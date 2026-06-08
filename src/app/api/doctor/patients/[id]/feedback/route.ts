import { created, fail, getRouteParams, readJson, type RouteContext } from "@/lib/api/response"
import { runQualityAgent } from "@/lib/ai/agents/quality-agent"
import { prisma } from "@/lib/db/prisma"

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

    const comment =
      body.comment ??
      [
        `分诊是否准确：${body.triageAccuracy ?? "未填写"}`,
        `推荐科室是否准确：${body.departmentAccuracy ?? "未填写"}`,
        `健康摘要是否有帮助：${body.summaryHelpful ?? "未填写"}`,
        `是否需要补充信息：${body.needMoreInfo ? "是" : "否"}`,
        `实际处理结果：${body.actualResult ?? "未填写"}`,
        `备注：${body.remark ?? "无"}`,
      ].join("\n")
    const inaccurate =
      body.triageAccuracy === "不准确" ||
      body.departmentAccuracy === "不准确" ||
      body.summaryHelpful === "无帮助"
    const rating = body.rating ?? (inaccurate ? 2 : 5)

    if (!comment.trim()) {
      return fail("validation_error", "反馈内容不能为空", 422)
    }

    const feedback = await prisma.agentFeedback.create({
      data: {
        sessionId: body.sessionId,
        runId: body.runId,
        rating,
        comment,
        source: `doctor:${id}`,
      },
    })
    const issues = await runQualityAgent({
      sessionId: body.sessionId,
      runId: body.runId,
      rating,
      comment,
    })

    const finalIssues = inaccurate
      ? [
          ...issues,
          {
            title: "医生反馈标记不准确",
            description: comment,
            severity: "HIGH",
            status: "OPEN",
          },
        ]
      : issues

    if (finalIssues.length > 0) {
      await prisma.qualityIssue.createMany({
        data: finalIssues.map((issue) => ({
          feedbackId: feedback.id,
          sessionId: body.sessionId,
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          status: issue.status,
        })),
      })
    }

    return created({ feedback, issues: finalIssues })
  } catch (error) {
    return fail(
      "feedback_failed",
      error instanceof Error ? error.message : "医生反馈提交失败",
      500
    )
  }
}
