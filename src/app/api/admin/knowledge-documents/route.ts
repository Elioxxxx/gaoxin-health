import { created, ok, readJson } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function GET() {
  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { chunks: true },
  })

  return ok(documents)
}

export async function POST(request: Request) {
  const body = await readJson<{
    title: string
    category?: string
    source?: string
    content?: string
    tags?: unknown
  }>(request)
  const document = await prisma.knowledgeDocument.create({
    data: {
      title: body.title,
      category: body.category ?? "未分类",
      source: body.source ?? "管理端",
      content: body.content ?? "",
      tags: stringifyJson(body.tags ?? []),
    },
  })

  return created(document)
}
