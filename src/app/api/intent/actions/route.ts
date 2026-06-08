import { created, fail, readJson } from "@/lib/api/response"
import { logUserAction } from "@/lib/intent/action-logger"

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      residentId?: string
      eventType?: string
      eventName?: string
      pagePath?: string
      content?: string
      targetType?: string
      targetId?: string
      metadata?: Record<string, unknown>
    }>(request)

    if (!body.eventType || !body.eventName) {
      return fail("validation_error", "缺少行为事件类型或名称", 422)
    }

    const event = await logUserAction({
      residentId: body.residentId,
      eventType: body.eventType,
      eventName: body.eventName,
      pagePath: body.pagePath,
      content: body.content,
      targetType: body.targetType,
      targetId: body.targetId,
      metadata: body.metadata,
    })

    return created({ event })
  } catch (error) {
    return fail("action_log_failed", error instanceof Error ? error.message : "行为记录失败", 500)
  }
}
