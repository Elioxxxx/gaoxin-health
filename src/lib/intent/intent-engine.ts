import {
  LeadStatus,
  type IntentInsight,
  type ServiceLead,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { intentTypeLabels, leadTypeLabels, receiverTypeLabels } from "@/lib/intent/intent-display"
import { matchIntentRules, type IntentRuleMatch } from "@/lib/intent/intent-rules"
import { routeLeadForIntent } from "@/lib/intent/lead-router"

const openLeadStatuses = [
  LeadStatus.PENDING,
  LeadStatus.VIEWED,
  LeadStatus.CONTACTED,
  LeadStatus.FOLLOWUP_ADDED,
  LeadStatus.TRANSFERRED,
]

export async function analyzeResidentIntent(residentId: string): Promise<{
  insights: IntentInsight[]
  leads: ServiceLead[]
}> {
  const resident = await prisma.residentProfile.findUnique({
    where: { id: residentId },
    include: { healthTags: true },
  })

  if (!resident) {
    throw new Error("居民不存在")
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const events = await prisma.userActionEvent.findMany({
    where: {
      residentId,
      occurredAt: { gte: since },
    },
    orderBy: { occurredAt: "desc" },
  })
  const matches = dedupeMatches(matchIntentRules({ events, resident }))
  const insights: IntentInsight[] = []
  const leads: ServiceLead[] = []

  for (const match of matches) {
    const route = await routeLeadForIntent(resident, match)
    const existingLead = await prisma.serviceLead.findFirst({
      where: {
        residentId,
        leadType: route.leadType,
        receiverType: route.receiverType,
        status: { in: openLeadStatuses },
      },
    })

    if (existingLead) {
      continue
    }

    const summary = mockLlmSummary(match, resident.name)
    const insight = await prisma.intentInsight.create({
      data: {
        residentId,
        intentType: match.intentType,
        title: `${resident.name}${intentTypeLabels[match.intentType]}`,
        summary: summary.insightSummary,
        confidence: calculateConfidence(match),
        evidenceEventsJson: JSON.stringify(
          match.evidenceEvents.map((event) => ({
            id: event.id,
            eventType: event.eventType,
            eventName: event.eventName,
            content: event.content,
            occurredAt: event.occurredAt,
          })),
          null,
          2
        ),
        suggestedReceiverType: route.receiverType,
        suggestedAction: summary.suggestedAction,
        priority: match.priority,
        status: LeadStatus.PENDING,
      },
    })
    const lead = await prisma.serviceLead.create({
      data: {
        residentId,
        intentInsightId: insight.id,
        receiverType: route.receiverType,
        receiverInstitutionId: route.receiverInstitutionId,
        receiverDepartmentId: route.receiverDepartmentId,
        leadType: route.leadType,
        title: `${resident.name}${leadTypeLabels[route.leadType]}服务线索`,
        summary: summary.leadSummary,
        suggestedAction: summary.suggestedAction,
        priority: match.priority,
        status: LeadStatus.PENDING,
      },
    })

    insights.push(insight)
    leads.push(lead)
  }

  return { insights, leads }
}

function dedupeMatches(matches: IntentRuleMatch[]) {
  const seen = new Set<string>()

  return matches.filter((match) => {
    const key = `${match.intentType}:${match.leadType}:${match.receiverType}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function calculateConfidence(match: IntentRuleMatch) {
  return Math.min(0.95, 0.66 + match.evidenceEvents.length * 0.05 + match.matchedKeywords.length * 0.03)
}

function mockLlmSummary(match: IntentRuleMatch, residentName: string) {
  const evidenceText = match.matchedKeywords.length > 0 ? match.matchedKeywords.join("、") : "近期行为记录"
  const receiver = receiverTypeLabels[match.receiverType]

  return {
    insightSummary: `${residentName}近期围绕“${evidenceText}”出现多次查询、查看或导诊动作。系统初步判断存在${intentTypeLabels[match.intentType]}，建议作为服务线索跟进，不作为诊断结论。`,
    leadSummary: `${residentName}形成${leadTypeLabels[match.leadType]}线索，建议分派给${receiver}结合健康档案和近期行为进行服务承接。`,
    suggestedAction: `建议${receiver}查看居民近期行为证据，结合健康档案进行电话提醒、导诊协助、复诊随访或健康科普。`,
  }
}
