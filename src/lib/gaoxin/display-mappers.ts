export type ResidentCareTone = "urgent" | "specialist" | "community" | "health"

export function getResidentCareAdvice(triageLevel: string): {
  title: string
  description: string
  tone: ResidentCareTone
  actionText: string
} {
  if (triageLevel === "P0") {
    return {
      title: "建议立即线下就医",
      description: "根据您描述的情况，建议优先选择急诊或拨打 120，避免延误。",
      tone: "urgent",
      actionText: "查看急诊导诊",
    }
  }

  if (triageLevel === "P1") {
    return {
      title: "建议尽快线下就医",
      description: "根据您的症状和既往健康信息，建议优先前往具备相应专科能力的医疗机构。",
      tone: "urgent",
      actionText: "查看推荐机构",
    }
  }

  if (triageLevel === "P2") {
    return {
      title: "建议专科门诊评估",
      description: "建议选择相应专科门诊进一步评估，系统已为您推荐合适的机构和科室。",
      tone: "specialist",
      actionText: "查看推荐门诊",
    }
  }

  if (triageLevel === "P3") {
    return {
      title: "建议社区或家庭医生服务",
      description: "该情况更适合社区卫生服务中心、家庭医生或慢病管理服务进行连续管理。",
      tone: "community",
      actionText: "查看社区服务",
    }
  }

  return {
    title: "建议健康管理与持续观察",
    description: "可先进行健康管理、记录指标变化，并在症状变化时及时就医。",
    tone: "health",
    actionText: "查看健康任务",
  }
}

export function getResidentCareToneClass(tone: ResidentCareTone) {
  const toneClasses = {
    urgent: {
      hero: "bg-[linear-gradient(135deg,#fb923c,#f43f5e)]",
      badge: "bg-orange-50 text-orange-700",
      soft: "bg-orange-50 text-orange-700 ring-orange-100",
    },
    specialist: {
      hero: "bg-[linear-gradient(135deg,#0ea5e9,#2563eb)]",
      badge: "bg-sky-50 text-sky-700",
      soft: "bg-sky-50 text-sky-700 ring-sky-100",
    },
    community: {
      hero: "bg-[linear-gradient(135deg,#059669,#10b981)]",
      badge: "bg-emerald-50 text-emerald-700",
      soft: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    health: {
      hero: "bg-[linear-gradient(135deg,#64748b,#0f766e)]",
      badge: "bg-slate-100 text-slate-700",
      soft: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  } as const

  return toneClasses[tone]
}

export function getRecommendationDisplayTag(recommendation: {
  institution: { type?: string; name: string }
  department: { name: string }
  doctor?: { isExpert?: boolean | null } | null
}) {
  const departmentName = recommendation.department.name

  if (/(慢病|全科|家庭医生)/.test(departmentName)) {
    return "连续管理"
  }

  if (
    recommendation.institution.type === "TERTIARY_HOSPITAL" &&
    recommendation.doctor?.isExpert
  ) {
    return "专科专家"
  }

  if (recommendation.institution.type === "TERTIARY_HOSPITAL") {
    return "专科门诊"
  }

  if (
    recommendation.institution.type === "COMMUNITY_HEALTH_CENTER" ||
    recommendation.institution.name.includes("社区卫生服务中心")
  ) {
    return "社区承接"
  }

  return "优先推荐"
}

export function getRecommendationReasonTags(recommendation: {
  institution: { type?: string; name: string }
  department: { name: string }
  doctor?: { isExpert?: boolean | null } | null
}) {
  const tags = ["优先推荐", getRecommendationDisplayTag(recommendation)]
  const departmentName = recommendation.department.name

  if (recommendation.doctor?.isExpert) {
    tags.push("专科能力匹配")
  }

  if (
    recommendation.institution.type === "COMMUNITY_HEALTH_CENTER" ||
    recommendation.institution.name.includes("社区卫生服务中心")
  ) {
    tags.push("就近便捷", "社区承接")
  }

  if (/(慢病|全科|家庭医生)/.test(departmentName)) {
    tags.push("适合慢病复诊", "适合后续随访")
  }

  return Array.from(new Set(tags)).slice(0, 4)
}

export function sanitizeResidentRecommendationReasons(reasons: string[]) {
  return reasons.map((reason) =>
    reason
      .replace(/P0\/P1\s*高风险场景优先推荐三甲医院/g, "症状情况更适合优先选择具备专科能力的医疗机构")
      .replace(/P0|P1|P2|P3|P4/g, "")
      .replace(/高风险/g, "需优先关注")
      .trim()
  )
}

export function sanitizeResidentAttentionItems(items: string[]) {
  return items.map((item) =>
    item
      .replace(/P0|P1|P2|P3|P4/g, "")
      .replace(/胸痛高风险/g, "胸痛胸闷需优先关注")
      .replace(/高风险/g, "需优先关注")
      .trim()
  )
}
