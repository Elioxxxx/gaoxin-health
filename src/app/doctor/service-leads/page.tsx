import { DoctorServiceLeadsDashboard, type DoctorServiceLeadItem } from "@/components/doctor/doctor-service-leads-dashboard"
import { prisma } from "@/lib/db/prisma"

export default async function DoctorServiceLeadsPage() {
  const leads = await prisma.serviceLead.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      resident: {
        include: {
          healthTags: true,
          userActionEvents: {
            orderBy: { occurredAt: "desc" },
            take: 3,
          },
        },
      },
      intentInsight: true,
      receiverInstitution: true,
      receiverDepartment: true,
      feedback: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">服务线索</h1>
        <p className="mt-2 text-sm text-slate-500">
          医院侧关注专科接诊、报告异常和导诊未预约；社区侧关注慢病随访、家庭医生和健康管理承接。
        </p>
      </div>
      <DoctorServiceLeadsDashboard
        leads={JSON.parse(JSON.stringify(leads)) as DoctorServiceLeadItem[]}
      />
    </div>
  )
}
