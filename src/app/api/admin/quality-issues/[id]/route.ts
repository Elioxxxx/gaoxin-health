import { qualityIssueUpdateSchema } from "@/lib/api/schemas"
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
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, qualityIssueUpdateSchema)
    const issue = await prisma.qualityIssue
      .update({
        where: { id },
        data: { status: body.status },
      })
      .catch(() => {
        throw new ApiError("not_found", "质量问题不存在", 404)
      })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_QUALITY_MANAGEMENT",
      action: "UPDATE_QUALITY_ISSUE",
      resourceType: "QualityIssue",
      resourceId: id,
      result: "SUCCESS",
      metadata: { status: issue.status },
    })

    return ok(issue)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_QUALITY_MANAGEMENT",
      action: "UPDATE_QUALITY_ISSUE",
      resourceType: "QualityIssue",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "quality_issue_update_failed", "质量问题更新失败")
  }
}
