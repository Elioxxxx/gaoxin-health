import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getDoctorIntentAnalysis } from "@/server/queries/doctor-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const data = await getDoctorIntentAnalysis(id)

  if (!data) {
    return fail("not_found", "患者不存在", 404)
  }

  return ok(data)
}
