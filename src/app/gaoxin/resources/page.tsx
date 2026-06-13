import { GaoxinResourcesClient } from "@/components/gaoxin/gaoxin-resources-client"
import { adaptGaoxinDoctors, adaptGaoxinInstitutions } from "@/lib/resource"
import {
  listDoctorsForResources,
  listInstitutionsForResources,
} from "@/server/queries/resource-query"

export default async function GaoxinResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; institution?: string; department?: string }>
}) {
  const { from, institution, department } = await searchParams
  const [institutions, doctors] = await Promise.all([
    listInstitutionsForResources(),
    listDoctorsForResources(),
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
