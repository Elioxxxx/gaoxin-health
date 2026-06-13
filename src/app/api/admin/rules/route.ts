import { TriageLevel } from "@/generated/prisma/client"
import { triageRuleCreateSchema } from "@/lib/api/schemas"
import {
  created,
  getRequestContextMeta,
  handleApiError,
  ok,
  parseJsonBody,
} from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function GET() {
  const rules = await prisma.triageRule.findMany({
    orderBy: { priority: "desc" },
  })

  return ok(rules)
}

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, triageRuleCreateSchema)
    const rule = await prisma.triageRule.create({
      data: {
        name: body.name,
        priority: body.priority ?? 50,
        enabled: body.enabled ?? true,
        symptomKeywords: stringifyJson(body.symptomKeywords ?? []),
        riskFactors: stringifyJson(body.riskFactors ?? []),
        triageLevel: body.triageLevel ?? TriageLevel.P4,
        suggestedDepartment: body.suggestedDepartment ?? "全科",
        suggestedCareType: body.suggestedCareType ?? "社区健康咨询",
        explanation: body.explanation ?? "管理端新增规则",
      },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_TRIAGE_RULE_MANAGEMENT",
      action: "CREATE_TRIAGE_RULE",
      resourceType: "TriageRule",
      resourceId: rule.id,
      result: "SUCCESS",
      metadata: { name: rule.name, triageLevel: rule.triageLevel },
    })

    return created(rule)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_TRIAGE_RULE_MANAGEMENT",
      action: "CREATE_TRIAGE_RULE",
      resourceType: "TriageRule",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "triage_rule_create_failed", "分诊规则创建失败")
  }
}
