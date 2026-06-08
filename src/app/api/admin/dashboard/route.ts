import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
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
      where: { institution: { type: "TERTIARY_HOSPITAL" } },
    }),
    prisma.recommendation.count({
      where: { institution: { type: "COMMUNITY_HEALTH_CENTER" } },
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
  const symptomCounter = new Map<string, number>()
  const departmentCounter = new Map<string, number>()

  for (const session of sessions) {
    if (session.report) {
      for (const item of safeArray(session.report.riskFlags)) {
        symptomCounter.set(item, (symptomCounter.get(item) ?? 0) + 1)
      }
    }
  }

  for (const item of recommendations) {
    departmentCounter.set(
      item.department.name,
      (departmentCounter.get(item.department.name) ?? 0) + 1
    )
  }

  const triageDistribution = ["P0", "P1", "P2", "P3", "P4"].map((level) => ({
    level,
    count: triageByLevel.find((item) => item.level === level)?._count.level ?? 0,
  }))
  const tertiaryFlow = recommendations.filter(
    (item) => item.institution.type === "TERTIARY_HOSPITAL"
  ).length
  const communityFlow = recommendations.filter(
    (item) => item.institution.type === "COMMUNITY_HEALTH_CENTER"
  ).length

  return ok({
    cards: {
      todayPreConsultCount,
      healthSummaryCount,
      tertiaryRecommendationCount,
      communityRecommendationCount,
      agentRunCount,
      agentErrorCount,
      qualityIssueCount,
      feedbackCount,
      feedbackAccuracyRate:
        feedbackCount === 0 ? 100 : Math.round((positiveFeedbackCount / feedbackCount) * 100),
    },
    triageDistribution,
    institutionFlow: [
      { name: "三甲医院", value: tertiaryFlow },
      { name: "社区卫生服务中心", value: communityFlow },
    ],
    hotSymptoms: Array.from(symptomCounter.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    hotDepartments: Array.from(departmentCounter.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
  })
}

function safeArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}
