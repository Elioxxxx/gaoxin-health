import { knowledgeDocumentUpdateSchema } from "@/lib/api/schemas"
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
    const body = await parseJsonBody(request, knowledgeDocumentUpdateSchema)
    const document = await prisma.knowledgeDocument
      .update({
        where: { id },
        data: {
          title: body.title,
          category: body.category,
          source: body.source,
          content: body.content,
          tags: body.tags === undefined ? undefined : stringifyJson(body.tags),
        },
      })
      .catch(() => {
        throw new ApiError("not_found", "知识文档不存在", 404)
      })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_KNOWLEDGE_MANAGEMENT",
      action: "UPDATE_KNOWLEDGE_DOCUMENT",
      resourceType: "KnowledgeDocument",
      resourceId: id,
      result: "SUCCESS",
      metadata: { changedFields: Object.keys(body) },
    })

    return ok(document)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_KNOWLEDGE_MANAGEMENT",
      action: "UPDATE_KNOWLEDGE_DOCUMENT",
      resourceType: "KnowledgeDocument",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "knowledge_document_update_failed", "知识文档更新失败")
  }
}
