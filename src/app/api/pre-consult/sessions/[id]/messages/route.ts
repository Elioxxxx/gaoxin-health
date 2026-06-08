import { MessageRole } from "@/generated/prisma/client"
import { created, fail, getRouteParams, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{ content?: string; role?: "USER" | "ASSISTANT" }>(request)

  if (!body.content) {
    return fail("validation_error", "content 不能为空", 422)
  }

  const message = await prisma.preConsultMessage.create({
    data: {
      sessionId: id,
      role: body.role === "ASSISTANT" ? MessageRole.ASSISTANT : MessageRole.USER,
      content: body.content,
      structuredJson: stringifyJson({ source: "api" }),
    },
  })

  return created(message)
}
