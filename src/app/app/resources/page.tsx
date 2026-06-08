import { ResourcesClient } from "@/components/resident/resources-client"
import { prisma } from "@/lib/db/prisma"

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const institutions = await prisma.institution.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  })
  const initialFilter =
    type === "community" ? "COMMUNITY_HEALTH_CENTER" : "all"

  return (
    <ResourcesClient
      institutions={JSON.parse(JSON.stringify(institutions)) as Parameters<typeof ResourcesClient>[0]["institutions"]}
      initialFilter={initialFilter}
    />
  )
}
