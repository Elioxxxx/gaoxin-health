import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const guidePlan = await prisma.guidePlan.findUnique({
    where: { id },
    include: {
      recommendation: {
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      },
      session: true,
    },
  })

  if (!guidePlan) {
    return fail("not_found", "导诊指引不存在", 404)
  }

  return ok(guidePlan)
}
