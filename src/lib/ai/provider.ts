import {
  detectScenario,
  scenarioLabel,
  scenarioQuestions,
  type ScenarioKey,
} from "@/lib/ai/scenarios"
import type { RuntimeConfig } from "@/lib/config/runtime"

export type AiProviderName =
  | "mock"
  | "openai"
  | "openai-compatible"
  | "doubao"
  | "volcengine"
  | "private"

export type CompleteJsonInput = {
  task: string
  prompt?: string
  input: unknown
  schemaName?: string
  signal?: AbortSignal
  metadata?: Record<string, unknown>
}

export interface AiProvider {
  name: AiProviderName
  model: string
  completeJson<T>(request: CompleteJsonInput): Promise<T>
}

export class MockAiProvider implements AiProvider {
  name: AiProviderName = "mock"
  model = "mock-medical-agent-v0.1"

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

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: AiProviderName
  readonly model: string

  constructor(
    private readonly options: {
      name: AiProviderName
      baseUrl: string
      apiKey: string
      model: string
    }
  ) {
    this.name = options.name
    this.model = options.model
  }

  async completeJson<T>(request: CompleteJsonInput): Promise<T> {
    const response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: request.signal,
      headers: {
        "Authorization": `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.options.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是健康服务平台的结构化信息助手。只能返回合法 JSON，不输出诊断结论，不输出 Markdown。",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: request.task,
              schemaName: request.schemaName,
              prompt: request.prompt,
              input: request.input,
            }),
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`AI Provider 请求失败：${response.status}`)
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = payload.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("AI Provider 未返回结构化内容")
    }

    return parseJsonContent<T>(content)
  }
}

function extractOriginalInput(input: unknown) {
  if (input && typeof input === "object" && "initialInput" in input) {
    return String((input as { initialInput?: unknown }).initialInput ?? "")
  }

  return typeof input === "string" ? input : JSON.stringify(input)
}

function parseJsonContent<T>(content: string): T {
  try {
    return JSON.parse(content) as T
  } catch {
    const jsonBlock = content.match(/\{[\s\S]*\}/)?.[0]

    if (!jsonBlock) {
      throw new Error("AI Provider 返回内容不是合法 JSON")
    }

    return JSON.parse(jsonBlock) as T
  }
}

export function getAiProvider(
  providerName: AiProviderName = "mock",
  config?: RuntimeConfig
): AiProvider {
  if (providerName === "mock") {
    return new MockAiProvider()
  }

  if (!config?.aiBaseUrl || !config.aiApiKey) {
    throw new Error(`AI Provider ${providerName} 缺少 AI_BASE_URL 或 AI_API_KEY`)
  }

  return new OpenAiCompatibleProvider({
    name: providerName,
    baseUrl: config.aiBaseUrl,
    apiKey: config.aiApiKey,
    model: config.aiModel,
  })
}
