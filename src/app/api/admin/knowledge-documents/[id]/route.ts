import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{
    title?: string
    category?: string
    source?: string
    content?: string
    tags?: unknown
  }>(request)

  try {
    const document = await prisma.knowledgeDocument.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        source: body.source,
        content: body.content,
        tags: body.tags === undefined ? undefined : stringifyJson(body.tags),
      },
    })

    return ok(document)
  } catch {
    return fail("not_found", "知识文档不存在", 404)
  }
}
