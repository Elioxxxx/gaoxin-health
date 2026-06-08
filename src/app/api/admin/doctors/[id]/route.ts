import { fail, getRouteParams, ok, readJson, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const body = await readJson<{
    institutionId?: string
    departmentId?: string
    name?: string
    title?: string
    specialties?: unknown
    isExpert?: boolean
    introduction?: string
  }>(request)

  try {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        institutionId: body.institutionId,
        departmentId: body.departmentId,
        name: body.name,
        title: body.title,
        specialties: body.specialties === undefined ? undefined : stringifyJson(body.specialties),
        isExpert: body.isExpert,
        introduction: body.introduction,
      },
    })

    return ok(doctor)
  } catch {
    return fail("not_found", "医生不存在", 404)
  }
}
