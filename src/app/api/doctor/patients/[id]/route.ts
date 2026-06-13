import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getDoctorPatientApiDetail } from "@/server/queries/doctor-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const patient = await getDoctorPatientApiDetail(id)

  if (!patient) {
    return fail("not_found", "患者不存在", 404)
  }

  return ok(patient)
}
