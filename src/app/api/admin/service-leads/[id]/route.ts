import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { LeadStatus } from "@/generated/prisma/client"

const statuses = new Set(Object.values(LeadStatus))

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  try {
    const { id } = await getRouteParams(context)
    const body = await readJson<{ status?: LeadStatus | string }>(request)

    if (!body.status || !statuses.has(body.status as LeadStatus)) {
      return fail("validation_error", "不支持的线索状态", 422)
    }

    const lead = await prisma.serviceLead.update({
      where: { id },
      data: { status: body.status as LeadStatus },
    })

    return ok({ lead })
  } catch (error) {
    return fail("service_lead_update_failed", error instanceof Error ? error.message : "线索更新失败", 500)
  }
}
