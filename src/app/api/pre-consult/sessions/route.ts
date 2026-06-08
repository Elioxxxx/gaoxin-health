import { created, fail, readJson } from "@/lib/api/response"
import { createPreConsultSession } from "@/lib/pre-consult/session-service"

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      residentId?: string
      initialInput?: string
      scenarioKey?: string
    }>(request)

    const initialInput = body.initialInput?.trim()

    if (!initialInput) {
      return fail("validation_error", "initialInput 不能为空", 422)
    }

    const session = await createPreConsultSession({
      residentId: body.residentId,
      initialInput,
      scenarioKey: body.scenarioKey,
    })

    return created(session)
  } catch (error) {
    return fail(
      "create_session_failed",
      error instanceof Error ? error.message : "创建智能预问诊会话失败",
      500
    )
  }
}
