import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const patient = await prisma.residentProfile.findUnique({
    where: { id },
    include: {
      healthTags: true,
      medicalRecords: { orderBy: { visitDate: "desc" }, include: { diagnoses: true, medications: true, labResults: true } },
      diagnoses: true,
      medications: true,
      labResults: true,
      allergies: true,
      healthSummaries: { orderBy: { createdAt: "desc" } },
      doctorProfiles: {
        orderBy: { generatedAt: "desc" },
        include: { riskFocusItems: { orderBy: { createdAt: "asc" } } },
      },
      userActionEvents: { orderBy: { occurredAt: "desc" } },
      intentInsights: { orderBy: { createdAt: "desc" } },
      serviceLeads: { orderBy: { createdAt: "desc" } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        include: {
          report: true,
          triageResult: true,
          recommendations: { include: { institution: true, department: true, doctor: true } },
        },
      },
    },
  })

  if (!patient) {
    return fail("not_found", "患者不存在", 404)
  }

  return ok(patient)
}
