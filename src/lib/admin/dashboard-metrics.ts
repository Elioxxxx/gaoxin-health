import type { TriageLevel } from "@/generated/prisma/client"

export type AdminDashboardMetricsInput = {
  todayPreConsultCount: number
  healthSummaryCount: number
  tertiaryRecommendationCount: number
  communityRecommendationCount: number
  agentRunCount: number
  agentErrorCount: number
  qualityIssueCount: number
  feedbackCount: number
  positiveFeedbackCount: number
  triageByLevel: Array<{ level: TriageLevel; _count: { level: number } }>
  symptomFlags: string[]
  recommendedDepartmentNames: string[]
  tertiaryFlow: number
  communityFlow: number
}

export function buildAdminDashboardMetrics(input: AdminDashboardMetricsInput) {
  return {
    cards: {
      todayPreConsultCount: input.todayPreConsultCount,
      healthSummaryCount: input.healthSummaryCount,
      tertiaryRecommendationCount: input.tertiaryRecommendationCount,
      communityRecommendationCount: input.communityRecommendationCount,
      agentRunCount: input.agentRunCount,
      agentErrorCount: input.agentErrorCount,
      qualityIssueCount: input.qualityIssueCount,
      feedbackCount: input.feedbackCount,
      feedbackAccuracyRate:
        input.feedbackCount === 0
          ? 100
          : Math.round((input.positiveFeedbackCount / input.feedbackCount) * 100),
    },
    triageDistribution: ["P0", "P1", "P2", "P3", "P4"].map((level) => ({
      level,
      count: input.triageByLevel.find((item) => item.level === level)?._count.level ?? 0,
    })),
    institutionFlow: [
      { name: "三甲医院", value: input.tertiaryFlow },
      { name: "社区卫生服务中心", value: input.communityFlow },
    ],
    hotSymptoms: topMetricItems(input.symptomFlags, 8),
    hotDepartments: topMetricItems(input.recommendedDepartmentNames, 8),
  }
}

export function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function countBy(values: string[]) {
  return values.reduce<Record<string, number>>(
    (acc, value) => ({ ...acc, [value]: (acc[value] ?? 0) + 1 }),
    {}
  )
}

export function topMetricItems(values: string[], limit = 10) {
  return Object.entries(countBy(values))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}
