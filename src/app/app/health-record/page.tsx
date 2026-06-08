import { HealthRecordClient } from "@/components/resident/health-record-client"
import { prisma } from "@/lib/db/prisma"

export default async function HealthRecordPage() {
  const residents = await prisma.residentProfile.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      healthTags: true,
      healthSummaries: { orderBy: { createdAt: "desc" } },
      medicalRecords: { orderBy: { visitDate: "desc" } },
      diagnoses: true,
      medications: true,
      allergies: true,
      labResults: true,
    },
  })

  return (
    <HealthRecordClient
      residents={JSON.parse(JSON.stringify(residents)) as Parameters<typeof HealthRecordClient>[0]["residents"]}
    />
  )
}
