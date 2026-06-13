import { LeadStatus } from "@/generated/prisma/client"
import { ApiError } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export const serviceLeadStatuses = new Set(Object.values(LeadStatus))

export function isServiceLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && serviceLeadStatuses.has(value as LeadStatus)
}

export function updateServiceLeadStatus(id: string, status: LeadStatus) {
  return prisma.serviceLead
    .update({
      where: { id },
      data: { status },
    })
    .catch(() => {
      throw new ApiError("not_found", "服务线索不存在", 404)
    })
}

export function updateDoctorServiceLeadStatus(id: string, status: LeadStatus) {
  return prisma.serviceLead
    .update({
      where: { id },
      data: { status },
      include: {
        resident: true,
        receiverInstitution: true,
        receiverDepartment: true,
        intentInsight: true,
      },
    })
    .catch(() => {
      throw new ApiError("not_found", "服务线索不存在", 404)
    })
}

export async function createServiceLeadFeedback(input: {
  serviceLeadId: string
  status?: LeadStatus
  operatorRole: string
  operatorName: string
  feedbackType: string
  comment?: string
}) {
  const lead = await prisma.serviceLead.findUnique({
    where: { id: input.serviceLeadId },
  })

  if (!lead) {
    return null
  }

  const [updatedLead, feedback] = await prisma.$transaction([
    prisma.serviceLead.update({
      where: { id: input.serviceLeadId },
      data: input.status ? { status: input.status } : {},
    }),
    prisma.leadFeedback.create({
      data: {
        serviceLeadId: input.serviceLeadId,
        operatorRole: input.operatorRole,
        operatorName: input.operatorName,
        feedbackType: input.feedbackType,
        comment: input.comment ?? "",
      },
    }),
  ])

  return { lead: updatedLead, feedback }
}
