import Link from "next/link"
import { ClipboardList } from "lucide-react"

import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { GaoxinEmptyState } from "@/components/gaoxin/gaoxin-empty-state"
import { prisma } from "@/lib/db/prisma"
import { buildGaoxinRecords, normalizeRecordType } from "@/lib/gaoxin/records-adapter"
import { cn } from "@/lib/utils"

const filters = [
  { key: "all", label: "全部" },
  { key: "registration", label: "挂号" },
  { key: "payment", label: "缴费" },
  { key: "report", label: "报告" },
  { key: "report-ai", label: "报告解读" },
  { key: "health-archive", label: "档案整理" },
  { key: "ai", label: "AI问诊" },
  { key: "guide", label: "导诊" },
  { key: "service-suggestion", label: "服务建议" },
  { key: "follow-up", label: "随访" },
  { key: "health-task", label: "健康任务" },
]

export default async function GaoxinRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const activeType = normalizeRecordType(type)
  const resident = await prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
  })

  const [sessions, guidePlans, healthTasks, medicalRecords, serviceLeads] = resident
    ? await Promise.all([
        prisma.preConsultSession.findMany({
          where: { residentId: resident.id },
          orderBy: { createdAt: "desc" },
          include: { triageResult: true },
        }),
        prisma.guidePlan.findMany({
          where: { session: { residentId: resident.id } },
          orderBy: { createdAt: "desc" },
          include: {
            recommendation: {
              include: {
                institution: true,
                department: true,
              },
            },
          },
        }),
        prisma.healthTask.findMany({
          where: { residentId: resident.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.medicalRecord.findMany({
          where: { residentId: resident.id },
          orderBy: { visitDate: "desc" },
        }),
        prisma.serviceLead.findMany({
          where: { residentId: resident.id },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], [], [], [], []]
  const records = buildGaoxinRecords({ sessions, guidePlans, healthTasks, medicalRecords, serviceLeads })
  const visible = activeType === "all" ? records : records.filter((item) => item.type === activeType)

  if (visible.length === 0) {
    return <GaoxinEmptyState title="我的记录" description="当前筛选条件下暂无记录。" />
  }

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="HEALTH_RECORD_VIEW"
        eventName="查看我的记录"
        content="我的记录列表"
        targetType="gaoxin_records"
      />
      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">我的记录</h1>
            <p className="mt-1 text-xs text-slate-400">挂号、缴费、报告、AI问诊、导诊和健康任务</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <Link
              key={item.key}
              href={item.key === "all" ? "/gaoxin/records" : `/gaoxin/records?type=${item.key}`}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
                activeType === item.key
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-white text-slate-600 ring-slate-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        {visible.map((item) => (
          <div key={item.id} className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.subtitle}</p>
                <p className="mt-2 text-xs text-slate-400">{item.date}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
