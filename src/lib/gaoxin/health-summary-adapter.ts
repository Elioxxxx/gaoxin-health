export type GaoxinHealthSummaryView = {
  memberName: string
  updatedAt: string
  tags: string[]
  steps: string
  sleep: string
  chronicTaskText: string
  organizedRecordCount: number
  institutionCount: number
  pendingTaskCount: number
  recentFocus: string
}

type HealthSummaryPayload = {
  name?: string
  healthTags?: Array<{ name?: string }>
  healthSummaries?: Array<{ updatedAt?: string; createdAt?: string }>
  medicalRecords?: Array<{ institutionName?: string }>
  healthTasks?: Array<{ status?: string }>
  intentInsights?: Array<{ title?: string; intentType?: string }>
}

export function adaptGaoxinHealthSummary(
  payload: unknown
): GaoxinHealthSummaryView {
  const data = isRecord(payload) ? (payload as HealthSummaryPayload) : {}
  const pendingTaskCount =
    data.healthTasks?.filter((task) => task.status !== "已完成").length ?? 1
  const hasHypertension =
    data.healthTags?.some((tag) => tag.name?.includes("高血压")) ?? true
  const reportCount = Math.max(data.medicalRecords?.length ?? 1, 1)
  const updatedAt = data.healthSummaries?.[0]?.updatedAt ?? data.healthSummaries?.[0]?.createdAt
  const institutionCount = new Set(
    data.medicalRecords?.map((record) => record.institutionName).filter(Boolean)
  ).size
  const recentInsight = data.intentInsights?.[0]

  return {
    memberName: data.name ?? "张建国",
    updatedAt: updatedAt ? formatTime(updatedAt) : "17:12",
    tags: [
      hasHypertension ? "高血压关注" : "健康关注",
      `近期报告 ${Math.min(reportCount, 1)} 份`,
      `待随访 ${Math.max(pendingTaskCount, 1)} 项`,
    ],
    steps: "13209 步",
    sleep: "7小时20分",
    chronicTaskText: `${Math.max(pendingTaskCount, 1)}项待完成`,
    organizedRecordCount: data.medicalRecords?.length ?? 0,
    institutionCount,
    pendingTaskCount: Math.max(pendingTaskCount, 1),
    recentFocus: intentTypeLabel(recentInsight?.intentType) ?? recentInsight?.title ?? "血压复诊",
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function intentTypeLabel(intentType: string | undefined) {
  const labels: Record<string, string> = {
    ACUTE_CARE_INTENT: "尽快就医咨询",
    SPECIALTY_CARE_INTENT: "专科就医",
    CHRONIC_DISEASE_MANAGEMENT: "血压复诊",
    REPORT_INTERPRETATION: "报告解读",
    FAMILY_DOCTOR_SIGNUP: "家医签约",
    CHILD_HEALTH: "儿童健康",
    MEDICATION_SAFETY: "用药安全",
  }

  return intentType ? labels[intentType] : undefined
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "17:12"
  }

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}
