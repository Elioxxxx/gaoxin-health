import { GaoxinResourcesClient } from "@/components/gaoxin/gaoxin-resources-client"
import { prisma } from "@/lib/db/prisma"
import { adaptGaoxinDoctors, adaptGaoxinInstitutions } from "@/lib/gaoxin/resources-adapter"

export default async function GaoxinResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; institution?: string; department?: string }>
}) {
  const { from, institution, department } = await searchParams
  const [institutions, doctors] = await Promise.all([
    prisma.institution.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      include: {
        departments: true,
        doctors: true,
        serviceCapabilities: true,
      },
    }),
    prisma.doctor.findMany({
      orderBy: [{ isExpert: "desc" }, { name: "asc" }],
      include: {
        institution: true,
        department: true,
      },
    }),
  ])

  return (
    <GaoxinResourcesClient
      institutions={adaptGaoxinInstitutions(institutions)}
      doctors={adaptGaoxinDoctors(doctors)}
      initialKeyword={department ?? institution ?? ""}
      sourceHint={
        from
          ? `已根据导诊推荐带入筛选：${[institution, department].filter(Boolean).join(" / ")}`
          : undefined
      }
    />
  )
}
