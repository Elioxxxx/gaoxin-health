import { AdminPageHeader } from "@/components/admin/admin-section"
import { KnowledgeManager } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminKnowledgePage() {
  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { chunks: true },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader title="知识库" description="维护医学指南、临床路径、服务知识、分诊规则和健康科普内容。" />
      <KnowledgeManager items={JSON.parse(JSON.stringify(documents))} />
    </div>
  )
}
