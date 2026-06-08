export type GaoxinHealthRecordView = {
  member: {
    name: string
    maskedId: string
    maskedPhone: string
    community: string
  }
  dataOverview: {
    medicalRecordCount: number
    institutionCount: number
    labResultCount: number
    medicationCount: number
    communityFollowUpCount: number
  }
  tags: string[]
  residentSummary: string
  doctorSummary: string
  timeline: Array<{
    id: string
    category: string
    institutionName: string
    departmentName: string
    date: string
    summary: string
  }>
  medications: string[]
  allergies: string[]
  labFocus: string[]
  usageItems: string[]
  attentionItems: string[]
}

type ResidentHealthPayload = {
  id?: string
  name?: string
  phone?: string
  community?: string
  healthTags?: Array<{ name?: string }>
  healthSummaries?: Array<{ summaryText?: string; summaryJson?: string }>
  medicalRecords?: Array<{
    id?: string
    institutionName?: string
    departmentName?: string
    visitDate?: string | Date
    diagnosisText?: string
    treatmentText?: string
    sourceType?: string
  }>
  diagnoses?: Array<{ name?: string; status?: string }>
  medications?: Array<{ name?: string; dosage?: string; frequency?: string }>
  allergies?: Array<{ allergen?: string; reaction?: string; severity?: string }>
  labResults?: Array<{
    itemName?: string
    value?: string
    unit?: string | null
    abnormalFlag?: string | null
    resultDate?: string | Date
  }>
  healthTasks?: Array<{ title?: string; status?: string }>
}

export function adaptGaoxinHealthRecord(payload: unknown): GaoxinHealthRecordView {
  const data = isRecord(payload) ? (payload as ResidentHealthPayload) : {}
  const summary = data.healthSummaries?.[0]
  const doctorSummary = readDoctorSummary(summary?.summaryJson)
  const tags = data.healthTags?.map((tag) => tag.name).filter(Boolean).map(sanitizeResidentTag) as
    | string[]
    | undefined
  const taskPending = data.healthTasks?.some((task) => task.status !== "已完成")
  const reportRecent = (data.labResults?.length ?? 0) > 0
  const institutions = new Set(
    data.medicalRecords?.map((record) => record.institutionName).filter(Boolean)
  )
  const communityFollowUpCount =
    data.medicalRecords?.filter((record) => isCommunityRecord(record.sourceType, record.institutionName)).length ??
    0

  return {
    member: {
      name: data.name ?? "张建国",
      maskedId: "5101********1217",
      maskedPhone: maskPhone(data.phone ?? "13800000001"),
      community: data.community ?? "高新区",
    },
    dataOverview: {
      medicalRecordCount: data.medicalRecords?.length ?? 0,
      institutionCount: institutions.size,
      labResultCount: data.labResults?.length ?? 0,
      medicationCount: data.medications?.length ?? 0,
      communityFollowUpCount,
    },
    tags:
      tags && tags.length > 0
        ? Array.from(new Set([...tags, "近期报告", taskPending ? "待随访" : "随访关注"]))
        : ["高血压关注", "慢病管理", reportRecent ? "近期报告" : "健康档案", "待随访"],
    residentSummary:
      summary?.summaryText ??
      "已汇总居民基本健康信息、既往就诊记录、用药和检查检验重点，供健康高新服务演示使用。",
    doctorSummary,
    timeline:
      data.medicalRecords?.map((record) => ({
        id: record.id ?? `${record.institutionName}-${record.visitDate}`,
        category: recordCategory(record.sourceType, record.institutionName),
        institutionName: record.institutionName ?? "高新区医疗机构",
        departmentName: record.departmentName ?? "全科",
        date: formatDate(record.visitDate),
        summary: `${record.diagnosisText ?? "健康随访"}；${record.treatmentText ?? "建议持续健康管理"}`,
      })) ?? [],
    medications:
      data.medications?.map((item) => `${item.name ?? "用药"} ${item.dosage ?? ""} ${item.frequency ?? ""}`) ??
      [],
    allergies:
      data.allergies?.map((item) => `${item.allergen ?? "未知"}：${item.reaction ?? "未记录"}（${item.severity ?? "未分级"}）`) ??
      [],
    labFocus:
      data.labResults
        ?.filter((item) => item.abnormalFlag && item.abnormalFlag !== "正常")
        .map((item) => `${item.itemName ?? "指标"} ${item.value ?? ""}${item.unit ?? ""}：${item.abnormalFlag}`) ??
      [],
    usageItems: [
      "用于智能预问诊时补充既往健康信息",
      "用于推荐更合适的医院和科室",
      "用于生成就医前导诊指引",
      "用于医生端查看诊前健康档案摘要",
      "用于慢病管理和社区随访提醒",
    ],
    attentionItems: [
      "近期建议关注血压变化",
      "建议按时完成复诊和随访",
      "就医时建议携带既往检查资料和用药清单",
      "如症状变化，请及时线下就医",
    ],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function maskPhone(phone: string) {
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : "138****0001"
}

function formatDate(value: string | Date | undefined) {
  if (!value) {
    return "未记录"
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "未记录" : date.toISOString().slice(0, 10)
}

function recordCategory(sourceType: string | undefined, institutionName: string | undefined) {
  const source = `${sourceType ?? ""}${institutionName ?? ""}`

  if (source.includes("community") || source.includes("public_health") || source.includes("社区")) {
    return "社区随访"
  }

  if (source.includes("exam") || source.includes("体检")) {
    return "体检报告"
  }

  if (source.includes("报告")) {
    return "报告解读"
  }

  return "医院记录"
}

function isCommunityRecord(sourceType: string | undefined, institutionName: string | undefined) {
  const source = `${sourceType ?? ""}${institutionName ?? ""}`
  return (
    source.includes("community") ||
    source.includes("public_health") ||
    source.includes("社区卫生服务中心")
  )
}

function readDoctorSummary(value: string | undefined) {
  if (!value) {
    return "医生版摘要将重点展示慢病风险、既往诊断、长期用药和需关注的检查检验异常。"
  }

  try {
    const parsed = JSON.parse(value) as { doctorSummary?: string }
    return parsed.doctorSummary ?? "医生版摘要将重点展示慢病风险、既往诊断、长期用药和需关注的检查检验异常。"
  } catch {
    return "医生版摘要将重点展示慢病风险、既往诊断、长期用药和需关注的检查检验异常。"
  }
}

function sanitizeResidentTag(value: string | undefined) {
  return (value ?? "健康关注")
    .replaceAll("高风险", "关注")
    .replaceAll("急性风险", "重点关注")
}
