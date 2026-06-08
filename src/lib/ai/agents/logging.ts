import { AgentRunStatus } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function runLoggedAgent<TInput, TOutput>({
  agentName,
  sessionId,
  input,
  handler,
}: {
  agentName: string
  sessionId?: string
  input: TInput
  handler: () => Promise<TOutput> | TOutput
}) {
  const startedAt = Date.now()

  try {
    const output = await handler()
    const latencyMs = Date.now() - startedAt

    await prisma.agentRun.create({
      data: {
        sessionId,
        agentName,
        inputJson: stringifyJson(input),
        outputJson: stringifyJson(output),
        status: AgentRunStatus.SUCCESS,
        latencyMs,
      },
    })

    return output
  } catch (error) {
    const latencyMs = Date.now() - startedAt

    await prisma.agentRun.create({
      data: {
        sessionId,
        agentName,
        inputJson: stringifyJson(input),
        outputJson: stringifyJson({
          message: error instanceof Error ? error.message : "未知 Agent 错误",
        }),
        status: AgentRunStatus.FAILED,
        latencyMs,
      },
    })

    throw error
  }
}
