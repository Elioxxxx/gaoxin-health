import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const resident = await prisma.residentProfile.findUnique({
    where: { id },
    select: { id: true, name: true, age: true, gender: true, community: true },
  })

  if (!resident) {
    return fail("not_found", "居民不存在", 404)
  }

  const [events, insights, leads] = await Promise.all([
    prisma.userActionEvent.findMany({
      where: { residentId: id },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.intentInsight.findMany({
      where: { residentId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceLead.findMany({
      where: { residentId: id },
      orderBy: { createdAt: "desc" },
      include: { receiverInstitution: true, receiverDepartment: true, feedback: true },
    }),
  ])

  return ok({ resident, events, insights, leads })
}
