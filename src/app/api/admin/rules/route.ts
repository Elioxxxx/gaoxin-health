import { TriageLevel } from "@/generated/prisma/client"
import { created, ok, readJson } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function GET() {
  const rules = await prisma.triageRule.findMany({
    orderBy: { priority: "desc" },
  })

  return ok(rules)
}

export async function POST(request: Request) {
  const body = await readJson<{
    name: string
    priority?: number
    symptomKeywords?: unknown
    riskFactors?: unknown
    triageLevel?: keyof typeof TriageLevel
    suggestedDepartment?: string
    suggestedCareType?: string
    explanation?: string
  }>(request)
  const rule = await prisma.triageRule.create({
    data: {
      name: body.name,
      priority: body.priority ?? 50,
      symptomKeywords: stringifyJson(body.symptomKeywords ?? []),
      riskFactors: stringifyJson(body.riskFactors ?? []),
      triageLevel: body.triageLevel ? TriageLevel[body.triageLevel] : TriageLevel.P4,
      suggestedDepartment: body.suggestedDepartment ?? "全科",
      suggestedCareType: body.suggestedCareType ?? "社区健康咨询",
      explanation: body.explanation ?? "管理端新增规则",
    },
  })

  return created(rule)
}
