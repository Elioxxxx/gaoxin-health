import { created, ok, readJson } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function GET() {
  const departments = await prisma.department.findMany({
    orderBy: [{ institution: { name: "asc" } }, { name: "asc" }],
    include: {
      institution: true,
      doctors: true,
    },
  })

  return ok(departments)
}

export async function POST(request: Request) {
  const body = await readJson<{
    institutionId: string
    name: string
    description?: string
    symptomKeywords?: unknown
    diseaseKeywords?: unknown
  }>(request)
  const department = await prisma.department.create({
    data: {
      institutionId: body.institutionId,
      name: body.name,
      description: body.description ?? "管理端新增科室",
      symptomKeywords: stringifyJson(body.symptomKeywords ?? []),
      diseaseKeywords: stringifyJson(body.diseaseKeywords ?? []),
    },
  })

  return created(department)
}
