import { rankRecommendations } from "@/lib/matching/resource-matcher"

import { runLoggedAgent } from "./logging"
import type { RecommendationDraft, ResourceBundle, TriageAgentOutput } from "./types"

export async function runRecommendationAgent(input: {
  sessionId?: string
  residentId: string
  residentCommunity: string
  triage: TriageAgentOutput
  resources: ResourceBundle
  historicalInstitutionNames: string[]
}) {
  return runLoggedAgent({
    agentName: "recommendation_agent",
    sessionId: input.sessionId,
    input,
    handler: (): RecommendationDraft[] =>
      rankRecommendations({
        triage: input.triage,
        residentCommunity: input.residentCommunity,
        resources: input.resources,
        historicalInstitutionNames: input.historicalInstitutionNames,
      }),
  })
}
