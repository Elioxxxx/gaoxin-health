import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })

  if (!doctor) {
    return fail("not_found", "医生不存在", 404)
  }

  return ok(doctor)
}
