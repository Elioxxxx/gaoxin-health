import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{
    institutionId?: string
    name?: string
    description?: string
    symptomKeywords?: unknown
    diseaseKeywords?: unknown
  }>(request)

  try {
    const department = await prisma.department.update({
      where: { id },
      data: {
        institutionId: body.institutionId,
        name: body.name,
        description: body.description,
        symptomKeywords:
          body.symptomKeywords === undefined ? undefined : stringifyJson(body.symptomKeywords),
        diseaseKeywords:
          body.diseaseKeywords === undefined ? undefined : stringifyJson(body.diseaseKeywords),
      },
    })

    return ok(department)
  } catch {
    return fail("not_found", "科室不存在", 404)
  }
}
