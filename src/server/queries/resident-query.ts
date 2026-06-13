import { prisma } from "@/lib/db/prisma"

export function getDefaultResident() {
  return prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      user: true,
      healthTags: true,
    },
  })
}

export async function getDefaultResidentHealthSummary() {
  const resident = await prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!resident) {
    return null
  }

  return prisma.residentProfile.findUnique({
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
}
