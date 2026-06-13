import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getPreConsultResult } from "@/lib/pre-consult"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const result = await getPreConsultResult(id)

  if (!result) {
    return fail("not_found", "预问诊会话不存在", 404)
  }

  return ok(result)
}
