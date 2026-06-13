import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getDoctorDetails } from "@/server/queries/resource-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const doctor = await getDoctorDetails(id)

  if (!doctor) {
    return fail("not_found", "医生不存在", 404)
  }

  return ok(doctor)
}
