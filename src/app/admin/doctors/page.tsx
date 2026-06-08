import { AdminPageHeader } from "@/components/admin/admin-section"
import { DoctorManager } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminDoctorsPage() {
  const [doctors, institutions, departments] = await Promise.all([
    prisma.doctor.findMany({
      orderBy: [{ isExpert: "desc" }, { name: "asc" }],
      include: { institution: true, department: { include: { institution: true } } },
    }),
    prisma.institution.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" }, include: { institution: true } }),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="医生管理" description="维护医生资源、专家池标记和擅长方向。" />
      <DoctorManager
        items={JSON.parse(JSON.stringify(doctors))}
        institutions={JSON.parse(JSON.stringify(institutions))}
        departments={JSON.parse(JSON.stringify(departments))}
      />
    </div>
  )
}
