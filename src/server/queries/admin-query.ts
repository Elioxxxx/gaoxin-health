import {
  InstitutionType,
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
} from "@/generated/prisma/client"
import {
  buildAdminDashboardMetrics,
  countBy,
  parseStringArray,
  topMetricItems,
} from "@/lib/admin/dashboard-metrics"
import { prisma } from "@/lib/db/prisma"

export type AdminServiceLeadFilters = {
  receiverType?: LeadReceiverType
  status?: LeadStatus
  priority?: LeadPriority
}

export async function getAdminDashboardData() {
  const [
    todayPreConsultCount,
    healthSummaryCount,
    tertiaryRecommendationCount,
    communityRecommendationCount,
    agentRunCount,
    agentErrorCount,
    qualityIssueCount,
    feedbackCount,
    positiveFeedbackCount,
    triageByLevel,
    sessions,
    recommendations,
  ] = await Promise.all([
    prisma.preConsultSession.count(),
    prisma.healthSummary.count(),
    prisma.recommendation.count({
      where: { institution: { type: InstitutionType.TERTIARY_HOSPITAL } },
    }),
    prisma.recommendation.count({
      where: { institution: { type: InstitutionType.COMMUNITY_HEALTH_CENTER } },
    }),
    prisma.agentRun.count(),
    prisma.agentRun.count({ where: { status: "FAILED" } }),
    prisma.qualityIssue.count(),
    prisma.agentFeedback.count(),
    prisma.agentFeedback.count({ where: { rating: { gte: 4 } } }),
    prisma.triageResult.groupBy({
      by: ["level"],
      _count: { level: true },
    }),
    prisma.preConsultSession.findMany({
      include: {
        report: true,
        triageResult: true,
      },
    }),
    prisma.recommendation.findMany({
      include: {
        institution: true,
        department: true,
      },
    }),
  ])

  return buildAdminDashboardMetrics({
    todayPreConsultCount,
    healthSummaryCount,
    tertiaryRecommendationCount,
    communityRecommendationCount,
    agentRunCount,
    agentErrorCount,
    qualityIssueCount,
    feedbackCount,
    positiveFeedbackCount,
    triageByLevel,
    symptomFlags: sessions.flatMap((session) =>
      session.report ? parseStringArray(session.report.riskFlags) : []
    ),
    recommendedDepartmentNames: recommendations.map((item) => item.department.name),
    tertiaryFlow: recommendations.filter(
      (item) => item.institution.type === InstitutionType.TERTIARY_HOSPITAL
    ).length,
    communityFlow: recommendations.filter(
      (item) => item.institution.type === InstitutionType.COMMUNITY_HEALTH_CENTER
    ).length,
  })
}

export async function getAdminIntentInsightDashboard() {
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [insights, leads, events] = await Promise.all([
    prisma.intentInsight.findMany({
      orderBy: { createdAt: "desc" },
      include: { resident: true },
      take: 200,
    }),
    prisma.serviceLead.findMany({
      orderBy: { createdAt: "desc" },
      include: { resident: true, receiverInstitution: true, receiverDepartment: true },
      take: 200,
    }),
    prisma.userActionEvent.findMany({
      where: { occurredAt: { gte: weekStart } },
      orderBy: { occurredAt: "desc" },
      take: 300,
    }),
  ])

  return {
    insights,
    leads,
    stats: {
      insightCount: insights.length,
      leadCount: leads.length,
      eventCount: events.length,
      byIntentType: countBy(insights.map((item) => item.intentType)),
      byLeadReceiver: countBy(leads.map((item) => item.receiverType)),
      hotQuestions: topMetricItems(events.map((item) => item.content).filter(Boolean) as string[]),
    },
  }
}

export function listAdminServiceLeads(filters: AdminServiceLeadFilters = {}) {
  return prisma.serviceLead.findMany({
    where: {
      receiverType: filters.receiverType,
      status: filters.status,
      priority: filters.priority,
    },
    orderBy: { createdAt: "desc" },
    include: {
      resident: true,
      intentInsight: true,
      receiverInstitution: true,
      receiverDepartment: true,
      feedback: { orderBy: { createdAt: "desc" } },
    },
  })
}
