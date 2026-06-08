import { getAiProvider } from "@/lib/ai/provider"
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
      const provider = getAiProvider()
      const output = await provider.completeJson<PreConsultAgentOutput>({
        task: "pre-consult",
        input,
      })

      return {
        ...output,
        scenarioKey: output.scenarioKey ?? detectScenario(input.initialInput),
      }
    },
  })
}
