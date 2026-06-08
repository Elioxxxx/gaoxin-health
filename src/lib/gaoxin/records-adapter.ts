export type GaoxinRecordItem = {
  id: string
  type: string
  title: string
  subtitle: string
  date: string
  status: string
}

type RecordsInput = {
  medicalRecords: Array<{
    id: string
    institutionName: string
    departmentName: string
    visitDate: Date
    diagnosisText: string
    sourceType: string
  }>
  sessions: Array<{
    id: string
    initialInput: string
    scenarioKey: string
    createdAt: Date
    triageResult?: { level: string; suggestedDepartment: string } | null
  }>
  guidePlans: Array<{
    id: string
    title: string
    createdAt: Date
    recommendation?: {
      institution?: { name: string }
      department?: { name: string }
    } | null
  }>
  healthTasks: Array<{
    id: string
    title: string
    type: string
    status: string
    createdAt: Date
  }>
  serviceLeads: Array<{
    id: string
    receiverType: string
    leadType: string
    title: string
    summary: string
    status: string
    createdAt: Date
  }>
}

export function buildGaoxinRecords(input: RecordsInput): GaoxinRecordItem[] {
  const fixed: GaoxinRecordItem[] = [
    {
      id: "registration-demo",
      type: "registration",
      title: "挂号记录",
      subtitle: "成都市第一人民医院 心血管内科",
      date: "2026-04-20",
      status: "已完成",
    },
    {
      id: "payment-demo",
      type: "payment",
      title: "缴费记录",
      subtitle: "门诊检查费用 128.00 元",
      date: "2026-04-20",
      status: "已支付",
    },
    {
      id: "report-demo",
      type: "report",
      title: "报告查询记录",
      subtitle: "血糖检查报告",
      date: "2026-04-18",
      status: "可查看",
    },
    {
      id: "report-ai-demo",
      type: "report-ai",
      title: "报告解读记录",
      subtitle: "小高健康助手已整理血糖、血脂等重点指标，便于后续就医准备。",
      date: "2026-04-18",
      status: "已解读",
    },
  ]

  const organizedRecords = input.medicalRecords.slice(0, 8).map((record) => ({
    id: `organized-${record.id}`,
    type: "health-archive",
    title: "健康档案整理记录",
    subtitle: `${record.institutionName} · ${record.departmentName} · ${recordCategory(record.sourceType)}：${record.diagnosisText}`,
    date: formatDate(record.visitDate),
    status: "已整理",
  }))
  const ai = input.sessions.map((session) => ({
    id: session.id,
    type: "ai",
    title: "AI问诊记录",
    subtitle: `${session.initialInput} · 已结合健康档案生成就医建议${session.triageResult?.suggestedDepartment ? `，建议关注${session.triageResult.suggestedDepartment}` : ""}`,
    date: formatDate(session.createdAt),
    status: "已生成",
  }))
  const guide = input.guidePlans.map((guidePlan) => ({
    id: guidePlan.id,
    type: "guide",
    title: "导诊记录",
    subtitle: `${guidePlan.recommendation?.institution?.name ?? "推荐机构"} ${guidePlan.recommendation?.department?.name ?? ""}`,
    date: formatDate(guidePlan.createdAt),
    status: "已生成",
  }))
  const tasks = input.healthTasks.map((task) => ({
    id: task.id,
    type: task.type.includes("随访") ? "follow-up" : "health-task",
    title: "健康任务记录",
    subtitle: task.title,
    date: formatDate(task.createdAt),
    status: task.status,
  }))
  const serviceSuggestions = input.serviceLeads.map((lead) => ({
    id: `service-${lead.id}`,
    type: "service-suggestion",
    title: serviceSuggestionTitle(lead.receiverType, lead.leadType),
    subtitle: serviceSuggestionSubtitle(lead.summary),
    date: formatDate(lead.createdAt),
    status: serviceSuggestionStatus(lead.status),
  }))

  return [...fixed, ...organizedRecords, ...ai, ...guide, ...tasks, ...serviceSuggestions].sort((a, b) =>
    b.date.localeCompare(a.date)
  )
}

export function normalizeRecordType(type?: string) {
  if (!type || type === "all") return "all"
  if (type === "family-doctor") return "follow-up"
  if (type === "medicine") return "all"
  if (type === "task") return "health-task"
  if (type === "report-ai") return "report-ai"
  if (type === "archive") return "health-archive"
  if (type === "service-lead") return "service-suggestion"
  if (type === "service-suggestion") return "service-suggestion"
  if (type === "tool") return "all"
  return type
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function recordCategory(sourceType: string) {
  if (sourceType.includes("community") || sourceType.includes("public_health") || sourceType.includes("社区")) {
    return "社区随访"
  }

  if (sourceType.includes("exam") || sourceType.includes("体检")) {
    return "体检报告"
  }

  return "医院记录"
}

function serviceSuggestionTitle(receiverType: string, leadType: string) {
  if (leadType === "CHRONIC_FOLLOWUP" || receiverType === "COMMUNITY_HEALTH_CENTER") {
    return "已为您生成社区随访建议"
  }

  if (leadType === "HEALTH_EDUCATION") {
    return "已为您生成健康科普建议"
  }

  if (leadType === "MEDICATION_SAFETY") {
    return "已为您生成用药安全提醒"
  }

  return "已为您生成专科就医建议"
}

function serviceSuggestionSubtitle(summary: string) {
  return summary
    .replaceAll("线索", "建议")
    .replaceAll("分派", "同步")
    .replaceAll("卫健端", "健康服务")
    .replaceAll("医院", "医疗机构")
}

function serviceSuggestionStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "待查看",
    VIEWED: "已查看",
    CONTACTED: "已联系",
    FOLLOWUP_ADDED: "已纳入随访",
    CLOSED: "已完成",
    IGNORED: "已忽略",
  }

  return labels[status] ?? "已生成"
}
