import { TriageLevel } from "@/generated/prisma/client"

import { fallbackTriageRules, loadActiveTriageRules, type NormalizedTriageRule } from "./triage-rules"

export type TriageRuleInput = {
  scenarioKey: string
  residentAge: number
  initialInput: string
  riskFlags: string[]
}

export type TriageDecision = {
  level: TriageLevel
  suggestedDepartment: string
  suggestedCareType: string
  reasons: string[]
  confidence: number
}

export async function evaluateTriage(input: TriageRuleInput): Promise<TriageDecision> {
  const dbRules = await loadActiveTriageRules()
  const rules = dbRules.length > 0 ? dbRules : fallbackTriageRules
  const hardCoded = evaluateHardCodedFallback(input)

  if (hardCoded) {
    return hardCoded
  }

  const text = `${input.scenarioKey} ${input.initialInput} ${input.riskFlags.join(" ")}`
  const matchedRule = rules
    .map((rule) => ({ rule, score: scoreRule(rule, text) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.rule.priority - a.rule.priority)[0]?.rule

  const rule = matchedRule ?? fallbackTriageRules[fallbackTriageRules.length - 1]

  return {
    level: rule.triageLevel,
    suggestedDepartment: rule.suggestedDepartment,
    suggestedCareType: rule.suggestedCareType,
    reasons: [rule.explanation, ...rule.symptomKeywords.slice(0, 3)],
    confidence: matchedRule ? 0.82 : 0.62,
  }
}

function evaluateHardCodedFallback(input: TriageRuleInput): TriageDecision | null {
  const text = `${input.scenarioKey} ${input.initialInput} ${input.riskFlags.join(" ")}`

  if (input.scenarioKey === "chest_pain_high_risk" || /(胸痛|胸闷)/.test(text)) {
    const highRisk = input.residentAge >= 60 || /(高血压|高龄|持续|2小时)/.test(text)

    return {
      level: highRisk ? TriageLevel.P1 : TriageLevel.P2,
      suggestedDepartment: "心血管内科",
      suggestedCareType: highRisk ? "三甲医院急诊/胸痛中心" : "心血管内科门诊",
      reasons: ["胸痛胸闷属于高风险症状", "合并高龄或高血压时需优先排查急性冠脉综合征"],
      confidence: highRisk ? 0.94 : 0.82,
    }
  }

  if (input.scenarioKey === "hypertension_followup") {
    return {
      level: TriageLevel.P3,
      suggestedDepartment: "慢病管理",
      suggestedCareType: "社区卫生服务中心/家庭医生",
      reasons: ["高血压稳定复诊", "适合社区慢病随访和续方管理"],
      confidence: 0.9,
    }
  }

  if (input.scenarioKey === "child_fever") {
    return {
      level: TriageLevel.P2,
      suggestedDepartment: "儿科",
      suggestedCareType: "儿科门诊或综合医院",
      reasons: ["儿童发热需评估精神状态和持续高热风险"],
      confidence: 0.88,
    }
  }

  if (input.scenarioKey === "high_glucose_exam") {
    return {
      level: /明显|很高|多饮|多尿|体重下降/.test(text) ? TriageLevel.P3 : TriageLevel.P4,
      suggestedDepartment: "慢病管理/内分泌科",
      suggestedCareType: "社区慢病管理或内分泌门诊",
      reasons: ["体检血糖偏高", "建议复查并评估糖尿病风险"],
      confidence: 0.84,
    }
  }

  if (input.scenarioKey === "cough_fever") {
    return {
      level: TriageLevel.P2,
      suggestedDepartment: "呼吸内科/全科",
      suggestedCareType: "呼吸内科或社区全科",
      reasons: ["咳嗽发热需排查呼吸道感染和肺炎风险"],
      confidence: 0.8,
    }
  }

  if (input.scenarioKey === "abdominal_pain_diarrhea") {
    return {
      level: TriageLevel.P2,
      suggestedDepartment: "消化内科/全科",
      suggestedCareType: "消化内科或社区全科",
      reasons: ["腹痛腹泻需评估感染、脱水和急腹症风险"],
      confidence: 0.8,
    }
  }

  return null
}

function scoreRule(rule: NormalizedTriageRule, text: string) {
  const symptomScore = rule.symptomKeywords.filter((keyword) => text.includes(keyword)).length * 3
  const riskScore = rule.riskFactors.filter((keyword) => text.includes(keyword)).length * 2

  return symptomScore + riskScore
}
