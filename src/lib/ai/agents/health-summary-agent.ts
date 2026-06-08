import { parseJsonArray } from "@/lib/json"

import { runLoggedAgent } from "./logging"
import type { HealthSummaryAgentOutput, ResidentHealthBundle } from "./types"

export async function runHealthSummaryAgent(input: {
  sessionId?: string
  healthBundle: ResidentHealthBundle
}) {
  return runLoggedAgent({
    agentName: "health_summary_agent",
    sessionId: input.sessionId,
    input,
    handler: (): HealthSummaryAgentOutput => {
      const { resident, healthTags, diagnoses, medications, labResults, allergies } =
        input.healthBundle
      const diagnosisNames = diagnoses.map((item) => item.name)
      const medicationNames = medications.map((item) => item.name)
      const abnormalLabs = labResults.filter(
        (item) => item.abnormalFlag && item.abnormalFlag !== "正常"
      )
      const allergyText = allergies.map((item) => item.allergen).join("、") || "无明确记录"
      const riskTags = [
        ...healthTags.map((tag) => tag.name),
        ...abnormalLabs.map((item) => `${item.itemName}${item.abnormalFlag}`),
      ]

      return {
        residentSummary: `${resident.name}，${resident.gender}，${resident.age}岁，来自${resident.community}。既往重点问题：${diagnosisNames.join("、") || "暂无"}。`,
        doctorSummary: [
          `居民：${resident.name}（${resident.age}岁，${resident.gender}）。`,
          `诊断史：${diagnosisNames.join("、") || "暂无明确诊断"}。`,
          `用药史：${medicationNames.join("、") || "暂无长期用药"}。`,
          `过敏史：${allergyText}。`,
          `异常检查：${abnormalLabs.map((item) => `${item.itemName}${item.value}${item.unit ?? ""}`).join("、") || "暂无明显异常"}。`,
        ].join("\n"),
        riskTags,
        structuredJson: {
          residentId: resident.id,
          diagnoses: diagnosisNames,
          medications: medicationNames,
          allergies: parseJsonArray(JSON.stringify(allergies.map((item) => item.allergen))),
          abnormalLabs: abnormalLabs.map((item) => ({
            itemName: item.itemName,
            value: item.value,
            unit: item.unit,
            abnormalFlag: item.abnormalFlag,
          })),
        },
      }
    },
  })
}
