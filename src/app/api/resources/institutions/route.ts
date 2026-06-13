import { institutionCreateSchema } from "@/lib/api/schemas"
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
import { listInstitutionsForResources } from "@/server/queries/resource-query"

export async function GET() {
  return ok(await listInstitutionsForResources())
}

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, institutionCreateSchema)
    const institution = await prisma.institution.create({
      data: {
        name: body.name,
        type: body.type,
        level: body.level ?? "待配置",
        address: body.address ?? "待配置",
        description: body.description ?? "管理端新增机构",
        capabilities: stringifyJson(body.capabilities ?? []),
      },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "CREATE_INSTITUTION_FROM_RESOURCE_API",
      resourceType: "Institution",
      resourceId: institution.id,
      result: "SUCCESS",
      metadata: { name: institution.name, type: institution.type },
    })

    return created(institution)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_RESOURCE_MANAGEMENT",
      action: "CREATE_INSTITUTION_FROM_RESOURCE_API",
      resourceType: "Institution",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "institution_create_failed", "机构创建失败")
  }
}
