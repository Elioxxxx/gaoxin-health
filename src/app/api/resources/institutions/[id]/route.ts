import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const institution = await prisma.institution.findUnique({
    where: { id },
    include: {
      departments: { include: { doctors: true } },
      doctors: true,
      serviceCapabilities: true,
    },
  })

  if (!institution) {
    return fail("not_found", "机构不存在", 404)
  }

  return ok(institution)
}
