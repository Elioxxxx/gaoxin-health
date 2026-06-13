import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getGuidePlanDetails } from "@/server/queries/resource-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const guidePlan = await getGuidePlanDetails(id)

  if (!guidePlan) {
    return fail("not_found", "导诊指引不存在", 404)
  }

  return ok(guidePlan)
}
