import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { runPreConsultSession } from "@/lib/pre-consult"

export async function POST(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)

  try {
    const result = await runPreConsultSession(id)
    return ok(result)
  } catch (error) {
    return fail(
      "run_failed",
      error instanceof Error ? error.message : "预问诊运行失败",
      500
    )
  }
}
