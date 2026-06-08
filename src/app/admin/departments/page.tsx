import { AdminPageHeader } from "@/components/admin/admin-section"
import { DepartmentManager } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminDepartmentsPage() {
  const [departments, institutions] = await Promise.all([
    prisma.department.findMany({
      orderBy: [{ institution: { name: "asc" } }, { name: "asc" }],
      include: { institution: true, doctors: true },
    }),
    prisma.institution.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="科室管理" description="按机构维护科室、症状关键词和疾病关键词。" />
      <DepartmentManager
        items={JSON.parse(JSON.stringify(departments))}
        institutions={JSON.parse(JSON.stringify(institutions))}
      />
    </div>
  )
}
