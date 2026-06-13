import { getRuntimeConfig, type RuntimeConfig } from "@/lib/config/runtime"

import { getAiProvider, MockAiProvider, type AiProvider, type CompleteJsonInput } from "./provider"

export type AiGatewayRequest<TInput> = Omit<CompleteJsonInput, "input"> & {
  input: TInput
  allowFallbackToMock?: boolean
  redactBeforeExternalCall?: boolean
  timeoutMs?: number
}

export class AiGateway {
  constructor(
    private readonly primaryProvider: AiProvider,
    private readonly config: RuntimeConfig,
    private readonly fallbackProvider: AiProvider = new MockAiProvider()
  ) {}

  async completeJson<TOutput, TInput = unknown>(
    request: AiGatewayRequest<TInput>
  ): Promise<TOutput> {
    const timeoutMs = request.timeoutMs ?? this.config.aiTimeoutMs
    const shouldRedact =
      request.redactBeforeExternalCall ?? this.primaryProvider.name !== "mock"
    const allowFallback = request.allowFallbackToMock ?? this.config.aiFallbackToMock
    const safeInput = shouldRedact ? redactSensitiveInput(request.input) : request.input

    try {
      return await withTimeout(timeoutMs, (signal) =>
        this.primaryProvider.completeJson<TOutput>({
          ...request,
          input: safeInput,
          signal,
          metadata: {
            ...request.metadata,
            gateway: "ai-gateway",
            provider: this.primaryProvider.name,
            model: this.primaryProvider.model,
            redacted: shouldRedact,
          },
        })
      )
    } catch (error) {
      if (!allowFallback || this.primaryProvider.name === "mock") {
        throw error
      }

      return this.fallbackProvider.completeJson<TOutput>({
        ...request,
        input: request.input,
        metadata: {
          ...request.metadata,
          gateway: "ai-gateway",
          provider: this.fallbackProvider.name,
          fallbackFrom: this.primaryProvider.name,
          fallbackReason: error instanceof Error ? error.message : "unknown",
        },
      })
    }
  }
}

export function getAiGateway(config = getRuntimeConfig()) {
  try {
    return new AiGateway(getAiProvider(config.aiProvider, config), config)
  } catch (error) {
    if (!config.aiFallbackToMock) {
      throw error
    }

    return new AiGateway(new MockAiProvider(), config)
  }
}

function redactSensitiveInput<TInput>(input: TInput): TInput {
  const serialized = JSON.stringify(input)

  if (!serialized) {
    return input
  }

  const json = serialized
    .replace(/\b1[3-9]\d{9}\b/g, "[手机号已脱敏]")
    .replace(/\b\d{6}(18|19|20)\d{2}\d{7}[\dXx]\b/g, "[身份证号已脱敏]")

  return JSON.parse(json) as TInput
}

async function withTimeout<T>(
  timeoutMs: number,
  handler: (signal: AbortSignal) => Promise<T>
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await handler(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}
