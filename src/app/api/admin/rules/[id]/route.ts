import { triageRuleUpdateSchema } from "@/lib/api/schemas"
import {
  ApiError,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  ok,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, triageRuleUpdateSchema)
    const rule = await prisma.triageRule
      .update({
        where: { id },
        data: {
          name: body.name,
          priority: body.priority,
          enabled: body.enabled,
          symptomKeywords:
            body.symptomKeywords === undefined ? undefined : stringifyJson(body.symptomKeywords),
          riskFactors:
            body.riskFactors === undefined ? undefined : stringifyJson(body.riskFactors),
          triageLevel: body.triageLevel,
          suggestedDepartment: body.suggestedDepartment,
          suggestedCareType: body.suggestedCareType,
          explanation: body.explanation,
        },
      })
      .catch(() => {
        throw new ApiError("not_found", "规则不存在", 404)
      })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_TRIAGE_RULE_MANAGEMENT",
      action: "UPDATE_TRIAGE_RULE",
      resourceType: "TriageRule",
      resourceId: id,
      result: "SUCCESS",
      metadata: { changedFields: Object.keys(body) },
    })

    return ok(rule)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_TRIAGE_RULE_MANAGEMENT",
      action: "UPDATE_TRIAGE_RULE",
      resourceType: "TriageRule",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "triage_rule_update_failed", "分诊规则更新失败")
  }
}
