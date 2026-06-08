import { safeJsonParse } from "@/lib/json-utils"

export type DoctorHealthProfileView = {
  id: string
  generatedAt: string
  summaryTitle: string
  onePageSummary: string
  majorProblemsJson: string
  currentVisitRelevanceJson: string
  sourceRecordsJson: string
  doctorChecklistJson: string
}

export type RiskFocusItemView = {
  id: string
  category: string
  title: string
  summary: string
  evidenceJson: string
  suggestedDoctorAction: string
  priority: string
}

export function parseJsonList(value: unknown): string[] {
  const parsed = safeJsonParse<unknown>(value, [])

  if (Array.isArray(parsed)) {
    return parsed.map((item) => {
      if (typeof item === "string") {
        return item
      }

      if (item && typeof item === "object") {
        return Object.values(item)
          .filter((part) => typeof part === "string" || typeof part === "number")
          .join(" · ")
      }

      return String(item)
    })
  }

  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed).map(([key, item]) => `${key}：${formatJsonValue(item)}`)
  }

  return []
}

export function formatJsonValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatJsonValue).join("；")
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .filter((item) => item !== null && item !== undefined && item !== "")
      .map(formatJsonValue)
      .join(" · ")
  }

  return String(value ?? "")
}

export const riskCategoryLabels: Record<string, string> = {
  ACUTE_RISK: "急性风险与就诊优先级",
  CHRONIC_CONTROL: "慢病与长期控制",
  MEDICATION_SAFETY: "用药安全与过敏禁忌",
  SPECIAL_POPULATION: "特殊体质/特殊人群",
  LAB_TREND: "检查检验异常与趋势",
  MAJOR_HISTORY: "既往重大病史与手术史",
  LIFESTYLE_RISK: "生活方式与行为风险",
  CARE_BEHAVIOR: "就医行为与依从性",
  PUBLIC_HEALTH_FOLLOWUP: "公卫/随访/筛查提示",
  DATA_QUALITY: "数据质量与待核实信息",
}

export const priorityLabels: Record<string, string> = {
  URGENT: "紧急",
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
}

export const priorityClasses: Record<string, string> = {
  URGENT: "bg-red-50 text-red-700 ring-red-200",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-200",
  MEDIUM: "bg-blue-50 text-blue-700 ring-blue-200",
  LOW: "bg-slate-50 text-slate-600 ring-slate-200",
}

export const intentTypeLabels: Record<string, string> = {
  ACUTE_CARE_INTENT: "急性就医意图",
  SPECIALTY_CARE_INTENT: "专科就医意图",
  CHRONIC_DISEASE_MANAGEMENT: "慢病管理意图",
  REPORT_INTERPRETATION: "报告解读意图",
  FAMILY_DOCTOR_SIGNUP: "家医签约意图",
  CHILD_HEALTH: "儿童健康意图",
  MATERNAL_HEALTH: "孕产妇健康意图",
  ELDERLY_HEALTH: "老年健康意图",
  HEALTH_ANXIETY: "健康焦虑意图",
  SERVICE_DROPOFF: "服务中断/就医延迟",
  MEDICATION_SAFETY: "用药安全意图",
  PUBLIC_HEALTH_FOLLOWUP: "公卫随访意图",
}

export const leadTypeLabels: Record<string, string> = {
  SPECIALTY_VISIT: "专科就诊",
  CHRONIC_FOLLOWUP: "慢病随访",
  REPORT_REVIEW: "报告复核",
  FAMILY_DOCTOR: "家庭医生",
  CHILD_CARE: "儿童保健",
  MATERNAL_CARE: "孕产妇服务",
  ELDERLY_CARE: "老年健康",
  MEDICATION_SAFETY: "用药安全",
  PUBLIC_HEALTH: "公共卫生",
  HEALTH_EDUCATION: "健康教育",
}

export const receiverTypeLabels: Record<string, string> = {
  HOSPITAL: "医院",
  COMMUNITY_HEALTH_CENTER: "社区卫生服务中心",
  HEALTH_COMMISSION: "卫健端",
}
