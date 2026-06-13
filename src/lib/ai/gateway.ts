import { getRuntimeConfig, type RuntimeConfig } from "@/lib/config/runtime"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"
import { redactSensitiveObject } from "@/lib/security/privacy"

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
    const startedAt = Date.now()

    try {
      const output = await withTimeout(timeoutMs, (signal) =>
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

      await recordAiInvocation({
        request,
        provider: this.primaryProvider.name,
        model: this.primaryProvider.model,
        status: "SUCCESS",
        latencyMs: Date.now() - startedAt,
        input: safeInput,
        output,
      })

      return output
    } catch (error) {
      if (!allowFallback || this.primaryProvider.name === "mock") {
        await recordAiInvocation({
          request,
          provider: this.primaryProvider.name,
          model: this.primaryProvider.model,
          status: "FAILED",
          latencyMs: Date.now() - startedAt,
          input: safeInput,
          errorMessage: error instanceof Error ? error.message : "unknown",
        })
        throw error
      }

      const fallbackStartedAt = Date.now()
      const output = await this.fallbackProvider.completeJson<TOutput>({
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

      await recordAiInvocation({
        request,
        provider: this.fallbackProvider.name,
        model: this.fallbackProvider.model,
        status: "SUCCESS",
        latencyMs: Date.now() - fallbackStartedAt,
        input: request.input,
        output,
        metadata: {
          fallbackFrom: this.primaryProvider.name,
          fallbackReason: error instanceof Error ? error.message : "unknown",
        },
      })

      return output
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
  return redactSensitiveObject(input)
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

async function recordAiInvocation(input: {
  request: AiGatewayRequest<unknown>
  provider: string
  model: string
  status: "SUCCESS" | "FAILED"
  latencyMs: number
  input: unknown
  output?: unknown
  errorMessage?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const sessionId =
      typeof input.request.metadata?.sessionId === "string"
        ? input.request.metadata.sessionId
        : undefined

    await prisma.aiInvocation.create({
      data: {
        sessionId,
        provider: input.provider,
        model: input.model,
        task: input.request.task,
        schemaName: input.request.schemaName,
        status: input.status,
        latencyMs: input.latencyMs,
        inputPreviewJson: previewJson(input.input),
        outputPreviewJson: input.output ? previewJson(input.output) : undefined,
        errorMessage: input.errorMessage,
        promptVersion:
          typeof input.request.metadata?.promptVersion === "string"
            ? input.request.metadata.promptVersion
            : undefined,
        metadataJson: stringifyJson({
          ...(input.request.metadata ?? {}),
          ...(input.metadata ?? {}),
        }),
      },
    })
  } catch (error) {
    console.error("ai_invocation_log_failed", error)
  }
}

function previewJson(value: unknown) {
  const redacted = redactSensitiveObject(value)
  const serialized = stringifyJson(redacted)

  return serialized.length > 6000 ? `${serialized.slice(0, 6000)}...` : serialized
}
