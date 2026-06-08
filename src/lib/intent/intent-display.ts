import {
  IntentType,
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
} from "@/generated/prisma/client"

export const intentTypeLabels: Record<IntentType, string> = {
  ACUTE_CARE_INTENT: "急性就医意图",
  SPECIALTY_CARE_INTENT: "专科就医意图",
  CHRONIC_DISEASE_MANAGEMENT: "慢病管理意图",
  REPORT_INTERPRETATION: "报告解读意图",
  FAMILY_DOCTOR_SIGNUP: "家庭医生签约意图",
  CHILD_HEALTH: "儿童健康意图",
  MATERNAL_HEALTH: "孕产妇健康意图",
  ELDERLY_HEALTH: "老年健康意图",
  HEALTH_ANXIETY: "健康焦虑意图",
  SERVICE_DROPOFF: "服务流失意图",
  MEDICATION_SAFETY: "用药安全意图",
  PUBLIC_HEALTH_FOLLOWUP: "公卫随访意图",
}

export const leadTypeLabels: Record<LeadType, string> = {
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

export const receiverTypeLabels: Record<LeadReceiverType, string> = {
  HOSPITAL: "医院",
  COMMUNITY_HEALTH_CENTER: "社区卫生服务中心",
  HEALTH_COMMISSION: "卫健端",
}

export const priorityLabels: Record<LeadPriority, string> = {
  URGENT: "紧急",
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  PENDING: "待处理",
  VIEWED: "已查看",
  CONTACTED: "已联系",
  FOLLOWUP_ADDED: "已加入随访",
  TRANSFERRED: "已转派",
  CLOSED: "已关闭",
  IGNORED: "已忽略",
}
