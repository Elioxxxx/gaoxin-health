import Link from "next/link"
import { AlertTriangle, ClipboardList, MessageSquareCheck, UsersRound } from "lucide-react"

import { WorklistTable, type WorklistItem } from "@/components/doctor/worklist-table"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db/prisma"
import { LeadReceiverType, LeadStatus } from "@/generated/prisma/client"

export default async function DoctorWorkspacePage() {
  const patients = await prisma.residentProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      healthTags: true,
      doctorProfiles: { orderBy: { generatedAt: "desc" }, take: 1 },
      intentInsights: { orderBy: { createdAt: "desc" }, take: 2 },
      serviceLeads: { where: { status: { in: [LeadStatus.PENDING, LeadStatus.VIEWED] } } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          triageResult: true,
          report: true,
          recommendations: {
            orderBy: { rank: "asc" },
            include: {
              institution: true,
              department: true,
              doctor: true,
            },
          },
        },
      },
    },
  })
  const feedbackCount = await prisma.agentFeedback.count()
  const highRiskCount = patients.filter((item) =>
    ["P0", "P1"].includes(item.sessions[0]?.triageResult?.level ?? "")
  ).length
  const doctorProfileCount = patients.filter((item) => item.doctorProfiles.length > 0).length
  const [hospitalLeadCount, communityLeadCount, pendingLeadCount] = await Promise.all([
    prisma.serviceLead.count({ where: { receiverType: LeadReceiverType.HOSPITAL } }),
    prisma.serviceLead.count({ where: { receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER } }),
    prisma.serviceLead.count({ where: { status: { in: [LeadStatus.PENDING, LeadStatus.VIEWED] } } }),
  ])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="患者案例库" value={patients.length} icon={UsersRound} tone="sky" />
        <StatCard title="P0/P1 高风险患者" value={highRiskCount} icon={AlertTriangle} tone="rose" />
        <StatCard title="医生版档案" value={doctorProfileCount} icon={ClipboardList} tone="amber" />
        <StatCard title="已反馈数量" value={feedbackCount} icon={MessageSquareCheck} tone="emerald" />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">服务线索视图</h2>
            <p className="mt-1 text-sm text-slate-500">
              当前有 {hospitalLeadCount} 条医院线索、{communityLeadCount} 条社区线索，其中 {pendingLeadCount} 条待查看或待联系。
            </p>
          </div>
          <Link href="/doctor/service-leads" className={buttonVariants({ variant: "default" })}>
            查看服务线索
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">待处理患者列表</h2>
          <p className="mt-1 text-sm text-slate-500">
            汇总预问诊推荐、医生版健康档案、行为意图和待处理服务线索。
          </p>
        </div>
        <WorklistTable items={JSON.parse(JSON.stringify(patients)) as WorklistItem[]} />
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: number
  icon: typeof UsersRound
  tone: "sky" | "rose" | "amber" | "emerald"
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  }

  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
        <div className={`flex size-9 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  )
}
