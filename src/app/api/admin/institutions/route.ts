import { created, ok, readJson } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function GET() {
  const institutions = await prisma.institution.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      departments: true,
      doctors: true,
      serviceCapabilities: true,
    },
  })

  return ok(institutions)
}

export async function POST(request: Request) {
  const body = await readJson<{
    name: string
    type: "TERTIARY_HOSPITAL" | "COMMUNITY_HEALTH_CENTER"
    level?: string
    address?: string
    description?: string
    capabilities?: unknown
  }>(request)
  const institution = await prisma.institution.create({
    data: {
      name: body.name,
      type: body.type,
      level: body.level ?? "待配置",
      address: body.address ?? "待配置",
      description: body.description ?? "管理端新增机构",
      capabilities: stringifyJson(body.capabilities ?? []),
    },
  })

  return created(institution)
}
