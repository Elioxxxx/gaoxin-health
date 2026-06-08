import {
  detectScenario,
  scenarioLabel,
  scenarioQuestions,
  type ScenarioKey,
} from "@/lib/ai/scenarios"

export type AiProviderName = "mock" | "openai" | "doubao" | "volcengine" | "private"

export type CompleteJsonInput = {
  task: string
  prompt?: string
  input: unknown
}

export interface AiProvider {
  name: AiProviderName
  completeJson<T>(request: CompleteJsonInput): Promise<T>
}

export class MockAiProvider implements AiProvider {
  name: AiProviderName = "mock"

  async completeJson<T>(request: CompleteJsonInput): Promise<T> {
    const text = JSON.stringify(request.input)
    const scenarioKey = detectScenario(text)
    const output = this.buildOutput(request.task, scenarioKey, request.input)

    return output as T
  }

  private buildOutput(task: string, scenarioKey: ScenarioKey, input: unknown) {
    if (task === "pre-consult") {
      return {
        scenarioKey,
        collectedFields: {
          scenario: scenarioLabel(scenarioKey),
          originalInput: extractOriginalInput(input),
          urgencySignals:
            scenarioKey === "chest_pain_high_risk" ? ["胸痛胸闷", "高龄", "高血压"] : [],
        },
        followUpQuestions: scenarioQuestions(scenarioKey),
      }
    }

    return {
      scenarioKey,
      label: scenarioLabel(scenarioKey),
      deterministic: true,
    }
  }
}

function extractOriginalInput(input: unknown) {
  if (input && typeof input === "object" && "initialInput" in input) {
    return String((input as { initialInput?: unknown }).initialInput ?? "")
  }

  return typeof input === "string" ? input : JSON.stringify(input)
}

export function getAiProvider(providerName: AiProviderName = "mock"): AiProvider {
  if (providerName !== "mock") {
    return new MockAiProvider()
  }

  return new MockAiProvider()
}
