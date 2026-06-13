import { doctorUpdateSchema } from "@/lib/api/schemas"
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
    const body = await parseJsonBody(request, doctorUpdateSchema)
    const doctor = await prisma.doctor
      .update({
        where: { id },
        data: {
          institutionId: body.institutionId,
          departmentId: body.departmentId,
          name: body.name,
          title: body.title,
          specialties:
            body.specialties === undefined ? undefined : stringifyJson(body.specialties),
          isExpert: body.isExpert,
          introduction: body.introduction,
        },
      })
      .catch(() => {
        throw new ApiError("not_found", "医生不存在", 404)
      })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "UPDATE_DOCTOR",
      resourceType: "Doctor",
      resourceId: id,
      result: "SUCCESS",
      metadata: { changedFields: Object.keys(body) },
    })

    return ok(doctor)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "UPDATE_DOCTOR",
      resourceType: "Doctor",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "doctor_update_failed", "医生更新失败")
  }
}
