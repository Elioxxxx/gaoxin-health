import { AdminPageHeader } from "@/components/admin/admin-section"
import { InstitutionManager } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminInstitutionsPage() {
  const institutions = await prisma.institution.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: { departments: true, doctors: true },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader title="机构管理" description="维护三甲医院、社区卫生服务中心及服务能力。" />
      <InstitutionManager items={JSON.parse(JSON.stringify(institutions))} />
    </div>
  )
}
