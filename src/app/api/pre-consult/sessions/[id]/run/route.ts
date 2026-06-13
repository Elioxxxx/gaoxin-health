import {
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  ok,
  type RouteContext,
} from "@/lib/api/response"
import { runPreConsultSession } from "@/lib/pre-consult"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function POST(_request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(_request)
  const auth = getAuthContext(_request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "pre-consult:write")
    const result = await runPreConsultSession(id)

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "PRE_CONSULT",
      action: "RUN_SESSION",
      resourceType: "PreConsultSession",
      resourceId: id,
      result: "SUCCESS",
      metadata: {
        recommendationCount: result.recommendations.length,
        guidePlanCount: result.guidePlans.length,
      },
    })

    return ok(result)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "PRE_CONSULT",
      action: "RUN_SESSION",
      resourceType: "PreConsultSession",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "run_failed", "预问诊运行失败")
  }
}
