import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { LeadStatus } from "@/generated/prisma/client"
import {
  isServiceLeadStatus,
  updateServiceLeadStatus,
} from "@/server/mutations/service-lead-mutation"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  try {
    const { id } = await getRouteParams(context)
    const body = await readJson<{ status?: LeadStatus | string }>(request)

    if (!isServiceLeadStatus(body.status)) {
      return fail("validation_error", "不支持的线索状态", 422)
    }

    const lead = await updateServiceLeadStatus(id, body.status)

    return ok({ lead })
  } catch (error) {
    return fail("service_lead_update_failed", error instanceof Error ? error.message : "线索更新失败", 500)
  }
}
