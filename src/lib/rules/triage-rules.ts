import type { TriageLevel, TriageRule } from "@/generated/prisma/client"
import { TriageLevel as TriageLevelValue } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"

export type NormalizedTriageRule = {
  id: string
  name: string
  priority: number
  symptomKeywords: string[]
  riskFactors: string[]
  triageLevel: TriageLevel
  suggestedDepartment: string
  suggestedCareType: string
  explanation: string
}

export async function loadActiveTriageRules() {
  const rules = await prisma.triageRule.findMany({
    where: { enabled: true },
    orderBy: { priority: "desc" },
  })

  return rules.map(normalizeTriageRule)
}

export function normalizeTriageRule(rule: TriageRule): NormalizedTriageRule {
  return {
    id: rule.id,
    name: rule.name,
    priority: rule.priority,
    symptomKeywords: parseJsonArray(rule.symptomKeywords),
    riskFactors: parseJsonArray(rule.riskFactors),
    triageLevel: rule.triageLevel,
    suggestedDepartment: rule.suggestedDepartment,
    suggestedCareType: rule.suggestedCareType,
    explanation: rule.explanation,
  }
}

export const fallbackTriageRules: NormalizedTriageRule[] = [
  {
    id: "fallback-chest-pain",
    name: "兜底胸痛规则",
    priority: 100,
    symptomKeywords: ["胸痛", "胸闷"],
    riskFactors: ["高龄", "高血压"],
    triageLevel: TriageLevelValue.P1,
    suggestedDepartment: "心血管内科",
    suggestedCareType: "三甲医院急诊/胸痛中心",
    explanation: "胸痛胸闷合并高龄或高血压，建议优先至三甲医院心血管相关急诊通道。",
  },
  {
    id: "fallback-hypertension",
    name: "兜底高血压复诊规则",
    priority: 70,
    symptomKeywords: ["高血压复诊", "续方"],
    riskFactors: ["稳定"],
    triageLevel: TriageLevelValue.P3,
    suggestedDepartment: "慢病管理",
    suggestedCareType: "社区卫生服务中心/家庭医生",
    explanation: "高血压稳定复诊可优先社区慢病管理。",
  },
  {
    id: "fallback-child-fever",
    name: "兜底儿童发热规则",
    priority: 80,
    symptomKeywords: ["儿童发热", "发热"],
    riskFactors: ["儿童"],
    triageLevel: TriageLevelValue.P2,
    suggestedDepartment: "儿科",
    suggestedCareType: "儿科门诊或综合医院",
    explanation: "儿童发热需进行儿科评估。",
  },
  {
    id: "fallback-glucose",
    name: "兜底血糖异常规则",
    priority: 50,
    symptomKeywords: ["血糖偏高", "体检异常"],
    riskFactors: ["血糖"],
    triageLevel: TriageLevelValue.P3,
    suggestedDepartment: "慢病管理/内分泌科",
    suggestedCareType: "社区慢病管理或内分泌门诊",
    explanation: "体检血糖异常建议复查并进入慢病风险管理。",
  },
  {
    id: "fallback-general",
    name: "兜底健康咨询规则",
    priority: 1,
    symptomKeywords: ["咨询"],
    riskFactors: [],
    triageLevel: TriageLevelValue.P4,
    suggestedDepartment: "全科",
    suggestedCareType: "社区健康咨询",
    explanation: "未识别到明显急症风险，建议从社区全科健康咨询开始。",
  },
]
