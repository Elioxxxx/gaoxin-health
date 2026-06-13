import { getRequestContextMeta, handleApiError, ok, parseJsonBody } from "@/lib/api/response"
import { analyzeResidentIntentSchema } from "@/lib/api/schemas"
import { analyzeResidentIntent } from "@/lib/intent/intent-engine"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "intent:write")
    const body = await parseJsonBody(request, analyzeResidentIntentSchema)
    const result = await analyzeResidentIntent(body.residentId)

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "INTENT_ANALYSIS",
      action: "ANALYZE_RESIDENT_INTENT",
      resourceType: "ResidentProfile",
      resourceId: body.residentId,
      result: "SUCCESS",
      metadata: { insightCount: result.insights.length, leadCount: result.leads.length },
    })

    return ok(result)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "INTENT_ANALYSIS",
      action: "ANALYZE_RESIDENT_INTENT",
      resourceType: "ResidentProfile",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "intent_analyze_failed", "意图分析失败")
  }
}
