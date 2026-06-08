import {
  IntentType,
  LeadPriority,
  LeadReceiverType,
  LeadType,
  UserActionEventType,
  type ResidentProfile,
  type UserActionEvent,
} from "@/generated/prisma/client"

export type IntentRuleMatch = {
  ruleId: string
  title: string
  intentType: IntentType
  receiverType: LeadReceiverType
  leadType: LeadType
  priority: LeadPriority
  evidenceEvents: UserActionEvent[]
  matchedKeywords: string[]
}

type IntentRule = {
  id: string
  title: string
  keywords: string[]
  eventTypes?: UserActionEventType[]
  minCount?: number
  intentType: IntentType
  receiverType: LeadReceiverType
  leadType: LeadType
  priority: LeadPriority
}

const rules: IntentRule[] = [
  {
    id: "chest-pain-specialty",
    title: "胸闷胸痛专科就医意图",
    keywords: ["胸闷", "胸痛", "心脏", "心梗", "心内科", "心血管"],
    eventTypes: [UserActionEventType.SEARCH, UserActionEventType.AI_CHAT, UserActionEventType.DOCTOR_VIEW],
    minCount: 1,
    intentType: IntentType.ACUTE_CARE_INTENT,
    receiverType: LeadReceiverType.HOSPITAL,
    leadType: LeadType.SPECIALTY_VISIT,
    priority: LeadPriority.URGENT,
  },
  {
    id: "hypertension-followup",
    title: "高血压慢病复诊意图",
    keywords: ["高血压", "血压", "降压药", "复诊", "续方"],
    minCount: 1,
    intentType: IntentType.CHRONIC_DISEASE_MANAGEMENT,
    receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
    leadType: LeadType.CHRONIC_FOLLOWUP,
    priority: LeadPriority.MEDIUM,
  },
  {
    id: "blood-sugar-followup",
    title: "血糖/糖尿病慢病管理意图",
    keywords: ["血糖", "糖尿病", "糖化血红蛋白", "体检血糖偏高"],
    minCount: 1,
    intentType: IntentType.CHRONIC_DISEASE_MANAGEMENT,
    receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
    leadType: LeadType.CHRONIC_FOLLOWUP,
    priority: LeadPriority.MEDIUM,
  },
  {
    id: "report-review",
    title: "报告解读服务意图",
    keywords: ["结节", "异常指标", "报告看不懂", "报告", "超声", "体检异常"],
    eventTypes: [UserActionEventType.REPORT_VIEW, UserActionEventType.REPORT_INTERPRET, UserActionEventType.AI_CHAT],
    minCount: 1,
    intentType: IntentType.REPORT_INTERPRETATION,
    receiverType: LeadReceiverType.HOSPITAL,
    leadType: LeadType.REPORT_REVIEW,
    priority: LeadPriority.MEDIUM,
  },
  {
    id: "family-doctor-signup",
    title: "家庭医生签约意图",
    keywords: ["家医", "签约", "随访", "家庭医生"],
    eventTypes: [UserActionEventType.FAMILY_DOCTOR_VIEW, UserActionEventType.SEARCH, UserActionEventType.AI_CHAT],
    minCount: 1,
    intentType: IntentType.FAMILY_DOCTOR_SIGNUP,
    receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
    leadType: LeadType.FAMILY_DOCTOR,
    priority: LeadPriority.MEDIUM,
  },
  {
    id: "child-health",
    title: "儿童健康服务意图",
    keywords: ["儿童", "孩子", "发热", "疫苗", "儿保"],
    minCount: 1,
    intentType: IntentType.CHILD_HEALTH,
    receiverType: LeadReceiverType.HOSPITAL,
    leadType: LeadType.CHILD_CARE,
    priority: LeadPriority.MEDIUM,
  },
  {
    id: "maternal-health",
    title: "孕产妇健康服务意图",
    keywords: ["孕期", "产检", "贫血", "孕妇", "胎儿"],
    minCount: 1,
    intentType: IntentType.MATERNAL_HEALTH,
    receiverType: LeadReceiverType.HOSPITAL,
    leadType: LeadType.MATERNAL_CARE,
    priority: LeadPriority.MEDIUM,
  },
  {
    id: "medication-safety",
    title: "用药安全服务意图",
    keywords: ["抗生素", "青霉素", "过敏", "药能不能吃", "头孢"],
    minCount: 1,
    intentType: IntentType.MEDICATION_SAFETY,
    receiverType: LeadReceiverType.HEALTH_COMMISSION,
    leadType: LeadType.MEDICATION_SAFETY,
    priority: LeadPriority.HIGH,
  },
]

export function matchIntentRules({
  events,
  resident,
}: {
  events: UserActionEvent[]
  resident: ResidentProfile
}): IntentRuleMatch[] {
  const matches = rules.flatMap((rule) => {
    const evidence = events.filter((event) => {
      const haystack = `${event.eventName} ${event.content ?? ""} ${event.pagePath} ${event.metadataJson}`.toLowerCase()
      const eventTypeOk = !rule.eventTypes || rule.eventTypes.includes(event.eventType)
      const keywordOk = rule.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
      return eventTypeOk && keywordOk
    })

    const matchedKeywords = rule.keywords.filter((keyword) =>
      evidence.some((event) => `${event.eventName} ${event.content ?? ""} ${event.metadataJson}`.includes(keyword))
    )

    return evidence.length >= (rule.minCount ?? 1)
      ? [{
          ruleId: rule.id,
          title: rule.title,
          intentType: rule.intentType,
          receiverType: rule.receiverType,
          leadType: rule.leadType,
          priority: rule.priority,
          evidenceEvents: evidence,
          matchedKeywords,
        }]
      : []
  })

  const anxiety = detectHealthAnxiety(events, resident)
  const dropoff = detectServiceDropoff(events)

  return [...matches, ...(anxiety ? [anxiety] : []), ...(dropoff ? [dropoff] : [])]
}

function detectHealthAnxiety(events: UserActionEvent[], resident: ResidentProfile): IntentRuleMatch | null {
  const recentTypes = new Set<UserActionEventType>([
    UserActionEventType.SEARCH,
    UserActionEventType.AI_CHAT,
    UserActionEventType.REPORT_VIEW,
  ])
  const recentConsults = events.filter((event) => recentTypes.has(event.eventType))
  const appointmentClicks = events.filter((event) => event.eventType === UserActionEventType.APPOINTMENT_CLICK)

  if (recentConsults.length <= 5 || appointmentClicks.length > 0) {
    return null
  }

  return {
    ruleId: "health-anxiety",
    title: `${resident.name}健康焦虑与科普服务意图`,
    intentType: IntentType.HEALTH_ANXIETY,
    receiverType: LeadReceiverType.HEALTH_COMMISSION,
    leadType: LeadType.HEALTH_EDUCATION,
    priority: LeadPriority.MEDIUM,
    evidenceEvents: recentConsults,
    matchedKeywords: ["反复咨询"],
  }
}

function detectServiceDropoff(events: UserActionEvent[]): IntentRuleMatch | null {
  const guideTypes = new Set<UserActionEventType>([
    UserActionEventType.GUIDE_GENERATED,
    UserActionEventType.GUIDE_ABANDONED,
  ])
  const guideEvents = events.filter((event) => guideTypes.has(event.eventType))
  const appointmentClicks = events.filter((event) => event.eventType === UserActionEventType.APPOINTMENT_CLICK)
  const doctorViews = events.filter((event) => event.eventType === UserActionEventType.DOCTOR_VIEW)

  if ((guideEvents.length === 0 && doctorViews.length < 2) || appointmentClicks.length > 0) {
    return null
  }

  return {
    ruleId: "service-dropoff",
    title: "导诊后未完成预约服务线索",
    intentType: IntentType.SERVICE_DROPOFF,
    receiverType: LeadReceiverType.HOSPITAL,
    leadType: LeadType.SPECIALTY_VISIT,
    priority: LeadPriority.MEDIUM,
    evidenceEvents: [...guideEvents, ...doctorViews],
    matchedKeywords: ["导诊未挂号", "多次查看医生"],
  }
}
