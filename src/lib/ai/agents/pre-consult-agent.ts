import { getAiGateway } from "@/lib/ai/gateway"
import { detectScenario } from "@/lib/ai/scenarios"

import { runLoggedAgent } from "./logging"
import type { PreConsultAgentOutput } from "./types"

export async function runPreConsultAgent(input: {
  sessionId?: string
  initialInput: string
  messageHistory?: string[]
}) {
  return runLoggedAgent({
    agentName: "pre_consult_agent",
    sessionId: input.sessionId,
    input,
    handler: async (): Promise<PreConsultAgentOutput> => {
      const gateway = getAiGateway()
      const output = await gateway.completeJson<PreConsultAgentOutput>({
        task: "pre-consult",
        schemaName: "PreConsultAgentOutput",
        input,
      })

      return {
        ...output,
        scenarioKey: output.scenarioKey ?? detectScenario(input.initialInput),
      }
    },
  })
}
