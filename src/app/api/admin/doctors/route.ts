import { doctorCreateSchema } from "@/lib/api/schemas"
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
  const doctors = await prisma.doctor.findMany({
    orderBy: [{ isExpert: "desc" }, { name: "asc" }],
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })

  return ok(doctors)
}

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, doctorCreateSchema)
    const doctor = await prisma.doctor.create({
      data: {
        institutionId: body.institutionId,
        departmentId: body.departmentId,
        name: body.name,
        title: body.title ?? "医师",
        specialties: stringifyJson(body.specialties ?? []),
        isExpert: body.isExpert ?? false,
        introduction: body.introduction ?? "管理端新增医生",
      },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "CREATE_DOCTOR",
      resourceType: "Doctor",
      resourceId: doctor.id,
      result: "SUCCESS",
      metadata: { name: doctor.name, institutionId: doctor.institutionId },
    })

    return created(doctor)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "CREATE_DOCTOR",
      resourceType: "Doctor",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "doctor_create_failed", "医生创建失败")
  }
}
