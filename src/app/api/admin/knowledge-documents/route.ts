import { knowledgeDocumentCreateSchema } from "@/lib/api/schemas"
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
  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { chunks: true },
  })

  return ok(documents)
}

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, knowledgeDocumentCreateSchema)
    const document = await prisma.knowledgeDocument.create({
      data: {
        title: body.title,
        category: body.category ?? "未分类",
        source: body.source ?? "管理端",
        content: body.content ?? "",
        tags: stringifyJson(body.tags ?? []),
      },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_KNOWLEDGE_MANAGEMENT",
      action: "CREATE_KNOWLEDGE_DOCUMENT",
      resourceType: "KnowledgeDocument",
      resourceId: document.id,
      result: "SUCCESS",
      metadata: { title: document.title, category: document.category },
    })

    return created(document)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_KNOWLEDGE_MANAGEMENT",
      action: "CREATE_KNOWLEDGE_DOCUMENT",
      resourceType: "KnowledgeDocument",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "knowledge_document_create_failed", "知识文档创建失败")
  }
}
