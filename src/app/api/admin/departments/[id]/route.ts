import { departmentUpdateSchema } from "@/lib/api/schemas"
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
    const body = await parseJsonBody(request, departmentUpdateSchema)
    const department = await prisma.department
      .update({
        where: { id },
        data: {
          institutionId: body.institutionId,
          name: body.name,
          description: body.description,
          symptomKeywords:
            body.symptomKeywords === undefined ? undefined : stringifyJson(body.symptomKeywords),
          diseaseKeywords:
            body.diseaseKeywords === undefined ? undefined : stringifyJson(body.diseaseKeywords),
        },
      })
      .catch(() => {
        throw new ApiError("not_found", "科室不存在", 404)
      })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "UPDATE_DEPARTMENT",
      resourceType: "Department",
      resourceId: id,
      result: "SUCCESS",
      metadata: { changedFields: Object.keys(body) },
    })

    return ok(department)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "UPDATE_DEPARTMENT",
      resourceType: "Department",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "department_update_failed", "科室更新失败")
  }
}
