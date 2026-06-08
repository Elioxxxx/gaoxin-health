import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{
    name?: string
    type?: "TERTIARY_HOSPITAL" | "COMMUNITY_HEALTH_CENTER"
    level?: string
    address?: string
    description?: string
    capabilities?: unknown
  }>(request)

  try {
    const institution = await prisma.institution.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        level: body.level,
        address: body.address,
        description: body.description,
        capabilities:
          body.capabilities === undefined ? undefined : stringifyJson(body.capabilities),
      },
    })

    return ok(institution)
  } catch {
    return fail("not_found", "机构不存在", 404)
  }
}
