import { departmentCreateSchema } from "@/lib/api/schemas"
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
  const departments = await prisma.department.findMany({
    orderBy: [{ institution: { name: "asc" } }, { name: "asc" }],
    include: {
      institution: true,
      doctors: true,
    },
  })

  return ok(departments)
}

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, departmentCreateSchema)
    const department = await prisma.department.create({
      data: {
        institutionId: body.institutionId,
        name: body.name,
        description: body.description ?? "管理端新增科室",
        symptomKeywords: stringifyJson(body.symptomKeywords ?? []),
        diseaseKeywords: stringifyJson(body.diseaseKeywords ?? []),
      },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "CREATE_DEPARTMENT",
      resourceType: "Department",
      resourceId: department.id,
      result: "SUCCESS",
      metadata: { name: department.name, institutionId: department.institutionId },
    })

    return created(department)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "CREATE_DEPARTMENT",
      resourceType: "Department",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "department_create_failed", "科室创建失败")
  }
}
