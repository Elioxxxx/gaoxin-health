import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const patient = await prisma.residentProfile.findUnique({
    where: { id },
    select: { id: true, name: true },
  })

  if (!patient) {
    return fail("not_found", "患者不存在", 404)
  }

  const [events, insights, serviceLeads] = await Promise.all([
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
      include: {
        receiverInstitution: true,
        receiverDepartment: true,
        feedback: { orderBy: { createdAt: "desc" } },
      },
    }),
  ])

  return ok({ resident: patient, events, insights, serviceLeads })
}
