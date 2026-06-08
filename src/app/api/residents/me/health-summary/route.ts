import { fail, ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const resident = await prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!resident) {
    return fail("not_found", "未找到 Mock 居民", 404)
  }

  const data = await prisma.residentProfile.findUnique({
    where: { id: resident.id },
    include: {
      healthTags: true,
      healthSummaries: { orderBy: { createdAt: "desc" } },
      medicalRecords: { orderBy: { visitDate: "desc" } },
      diagnoses: true,
      medications: true,
      labResults: true,
      allergies: true,
      healthTasks: { orderBy: { createdAt: "desc" } },
      intentInsights: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  return ok(data)
}
