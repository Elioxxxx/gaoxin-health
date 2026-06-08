import { TriageLevel } from "@/generated/prisma/client"
import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{
    name?: string
    priority?: number
    enabled?: boolean
    symptomKeywords?: unknown
    riskFactors?: unknown
    triageLevel?: keyof typeof TriageLevel
    suggestedDepartment?: string
    suggestedCareType?: string
    explanation?: string
  }>(request)

  try {
    const rule = await prisma.triageRule.update({
      where: { id },
      data: {
        name: body.name,
        priority: body.priority,
        enabled: body.enabled,
        symptomKeywords:
          body.symptomKeywords === undefined ? undefined : stringifyJson(body.symptomKeywords),
        riskFactors: body.riskFactors === undefined ? undefined : stringifyJson(body.riskFactors),
        triageLevel: body.triageLevel ? TriageLevel[body.triageLevel] : undefined,
        suggestedDepartment: body.suggestedDepartment,
        suggestedCareType: body.suggestedCareType,
        explanation: body.explanation,
      },
    })

    return ok(rule)
  } catch {
    return fail("not_found", "规则不存在", 404)
  }
}
