import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getInstitutionDetails } from "@/server/queries/resource-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const institution = await getInstitutionDetails(id)

  if (!institution) {
    return fail("not_found", "机构不存在", 404)
  }

  return ok(institution)
}
