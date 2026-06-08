import { created, fail, getRouteParams, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { LeadStatus } from "@/generated/prisma/client"

const allowedStatuses = new Set([
  "PENDING",
  "VIEWED",
  "CONTACTED",
  "FOLLOWUP_ADDED",
  "TRANSFERRED",
  "CLOSED",
  "IGNORED",
])
const leadStatusValues: Record<string, LeadStatus> = {
  PENDING: LeadStatus.PENDING,
  VIEWED: LeadStatus.VIEWED,
  CONTACTED: LeadStatus.CONTACTED,
  FOLLOWUP_ADDED: LeadStatus.FOLLOWUP_ADDED,
  TRANSFERRED: LeadStatus.TRANSFERRED,
  CLOSED: LeadStatus.CLOSED,
  IGNORED: LeadStatus.IGNORED,
}

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

    if (body.status && !allowedStatuses.has(body.status)) {
      return fail("validation_error", "不支持的线索状态", 422)
    }

    const lead = await prisma.serviceLead.findUnique({ where: { id } })

    if (!lead) {
      return fail("not_found", "服务线索不存在", 404)
    }

    const [updatedLead, feedback] = await prisma.$transaction([
      prisma.serviceLead.update({
        where: { id },
        data: body.status ? { status: leadStatusValues[body.status] } : {},
      }),
      prisma.leadFeedback.create({
        data: {
          serviceLeadId: id,
          operatorRole: body.operatorRole ?? "DOCTOR",
          operatorName: body.operatorName ?? "医生端演示账号",
          feedbackType: body.feedbackType ?? "DOCTOR_ACTION",
          comment: body.comment ?? "医生端更新服务线索状态。",
        },
      }),
    ])

    return created({ lead: updatedLead, feedback })
  } catch (error) {
    return fail(
      "lead_feedback_failed",
      error instanceof Error ? error.message : "服务线索反馈失败",
      500
    )
  }
}
