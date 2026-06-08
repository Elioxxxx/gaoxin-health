import { scenarioLabel } from "@/lib/ai/scenarios"

import { runLoggedAgent } from "./logging"
import type { ReportGenerationInput, ReportGenerationOutput } from "./types"

export async function runReportGenerationAgent(input: ReportGenerationInput) {
  return runLoggedAgent({
    agentName: "report_generation_agent",
    sessionId: input.sessionId,
    input,
    handler: (): ReportGenerationOutput => {
      const riskFlags = buildRiskFlags(input)

      return {
        chiefComplaint: buildChiefComplaint(input),
        presentIllness: buildPresentIllness(input),
        pastHistory: extractPastHistory(input.healthSummary.doctorSummary),
        medicationHistory: extractMedicationHistory(input.healthSummary.doctorSummary),
        allergyHistory: extractAllergyHistory(input.healthSummary.doctorSummary),
        riskFlags,
        patientExplanation: `系统已根据“${scenarioLabel(input.scenarioKey)}”场景生成预问诊报告。本结果仅用于演示导诊流程，不替代医生诊断。`,
        doctorSummary: `${input.resident.name}${input.resident.age}岁，${buildChiefComplaint(input)}。${riskFlags.join("；")}。`,
        structuredJson: {
          scenarioKey: input.scenarioKey,
          originalInput: input.initialInput,
          healthSummary: input.healthSummary.structuredJson,
          riskFlags,
        },
      }
    },
  })
}

function buildChiefComplaint(input: ReportGenerationInput) {
  const map = {
    chest_pain_high_risk: "胸闷胸痛",
    hypertension_followup: "高血压复诊",
    child_fever: "儿童发热",
    high_glucose_exam: "体检血糖偏高",
    cough_fever: "咳嗽发热",
    abdominal_pain_diarrhea: "腹痛腹泻",
    general_health_consult: "健康咨询",
  } as const

  return map[input.scenarioKey]
}

function buildPresentIllness(input: ReportGenerationInput) {
  if (input.scenarioKey === "chest_pain_high_risk") {
    return "居民自述胸闷胸痛，结合高龄和高血压史，需要优先识别急性胸痛风险。"
  }

  if (input.scenarioKey === "child_fever") {
    return "儿童发热，需要关注最高体温、精神反应、进食饮水和伴随症状。"
  }

  return `居民输入：${input.initialInput}`
}

function buildRiskFlags(input: ReportGenerationInput) {
  const flags = new Set<string>(input.healthSummary.riskTags)

  if (input.scenarioKey === "chest_pain_high_risk") {
    flags.add("胸痛胸闷")
    flags.add("高龄")
    flags.add("高血压")
    flags.add("需排查急性冠脉综合征")
  }

  if (input.scenarioKey === "child_fever") {
    flags.add("儿童发热")
  }

  if (input.scenarioKey === "high_glucose_exam") {
    flags.add("体检血糖异常")
  }

  return Array.from(flags)
}

function extractPastHistory(summary: string) {
  return summary.match(/诊断史：(.+?)。/)?.[1] ?? "详见健康档案。"
}

function extractMedicationHistory(summary: string) {
  return summary.match(/用药史：(.+?)。/)?.[1] ?? "详见历史用药。"
}

function extractAllergyHistory(summary: string) {
  return summary.match(/过敏史：(.+?)。/)?.[1] ?? "详见过敏记录。"
}
