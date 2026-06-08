import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{ status?: "OPEN" | "REVIEWING" | "RESOLVED" }>(request)

  try {
    const issue = await prisma.qualityIssue.update({
      where: { id },
      data: { status: body.status ?? "OPEN" },
    })

    return ok(issue)
  } catch {
    return fail("not_found", "质量问题不存在", 404)
  }
}
