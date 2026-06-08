import { runLoggedAgent } from "./logging"
import type { QualityIssueDraft } from "./types"

export async function runQualityAgent(input: {
  sessionId?: string
  runId?: string
  rating: number
  comment: string
}) {
  return runLoggedAgent({
    agentName: "quality_agent",
    sessionId: input.sessionId,
    input,
    handler: (): QualityIssueDraft[] => {
      if (input.rating >= 4 && !/(错误|不准|遗漏|风险)/.test(input.comment)) {
        return []
      }

      return [
        {
          title: input.rating <= 2 ? "医生反馈低分" : "医生反馈提示需复核",
          description: input.comment || "医生反馈为空，需人工复核。",
          severity: input.rating <= 2 ? "HIGH" : "MEDIUM",
          status: "OPEN",
        },
      ]
    },
  })
}
