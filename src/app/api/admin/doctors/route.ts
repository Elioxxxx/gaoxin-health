import { created, ok, readJson } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    orderBy: [{ isExpert: "desc" }, { name: "asc" }],
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })

  return ok(doctors)
}

export async function POST(request: Request) {
  const body = await readJson<{
    institutionId: string
    departmentId: string
    name: string
    title?: string
    specialties?: unknown
    isExpert?: boolean
    introduction?: string
  }>(request)
  const doctor = await prisma.doctor.create({
    data: {
      institutionId: body.institutionId,
      departmentId: body.departmentId,
      name: body.name,
      title: body.title ?? "医师",
      specialties: stringifyJson(body.specialties ?? []),
      isExpert: body.isExpert ?? false,
      introduction: body.introduction ?? "管理端新增医生",
    },
  })

  return created(doctor)
}
