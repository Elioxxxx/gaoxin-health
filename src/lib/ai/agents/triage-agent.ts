import { evaluateTriage } from "@/lib/rules/rule-engine"

import { runLoggedAgent } from "./logging"
import type { ReportGenerationOutput } from "./types"

export async function runTriageAgent(input: {
  sessionId?: string
  scenarioKey: string
  residentAge: number
  report: ReportGenerationOutput
  initialInput: string
}) {
  return runLoggedAgent({
    agentName: "triage_agent",
    sessionId: input.sessionId,
    input,
    handler: () =>
      evaluateTriage({
        scenarioKey: input.scenarioKey,
        residentAge: input.residentAge,
        initialInput: input.initialInput,
        riskFlags: input.report.riskFlags,
      }),
  })
}
