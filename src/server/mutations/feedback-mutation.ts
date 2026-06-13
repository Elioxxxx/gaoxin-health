import { runQualityAgent } from "@/lib/ai/agents/quality-agent"
import { prisma } from "@/lib/db/prisma"

export type DoctorFeedbackInput = {
  doctorId: string
  sessionId: string
  runId?: string
  rating?: number
  comment?: string
  triageAccuracy?: string
  departmentAccuracy?: string
  summaryHelpful?: string
  needMoreInfo?: boolean
  actualResult?: string
  remark?: string
}

export async function submitDoctorFeedback(input: DoctorFeedbackInput) {
  const comment =
    input.comment ??
    [
      `分诊是否准确：${input.triageAccuracy ?? "未填写"}`,
      `推荐科室是否准确：${input.departmentAccuracy ?? "未填写"}`,
      `健康摘要是否有帮助：${input.summaryHelpful ?? "未填写"}`,
      `是否需要补充信息：${input.needMoreInfo ? "是" : "否"}`,
      `实际处理结果：${input.actualResult ?? "未填写"}`,
      `备注：${input.remark ?? "无"}`,
    ].join("\n")
  const inaccurate =
    input.triageAccuracy === "不准确" ||
    input.departmentAccuracy === "不准确" ||
    input.summaryHelpful === "无帮助"
  const rating = input.rating ?? (inaccurate ? 2 : 5)

  if (!comment.trim()) {
    throw new Error("反馈内容不能为空")
  }

  const feedback = await prisma.agentFeedback.create({
    data: {
      sessionId: input.sessionId,
      runId: input.runId,
      rating,
      comment,
      source: `doctor:${input.doctorId}`,
    },
  })
  const issues = await runQualityAgent({
    sessionId: input.sessionId,
    runId: input.runId,
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
        sessionId: input.sessionId,
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
      })),
    })
  }

  return { feedback, issues: finalIssues }
}
