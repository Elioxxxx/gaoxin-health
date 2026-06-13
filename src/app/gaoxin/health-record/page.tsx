import Link from "next/link"
import type { ReactNode } from "react"
import {
  Bot,
  Building2,
  ChevronDown,
  ClipboardList,
  FileHeart,
  FlaskConical,
  Pill,
  RefreshCcw,
  UserRound,
} from "lucide-react"

import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { GaoxinHealthCard } from "@/components/gaoxin/gaoxin-health-card"
import { prisma } from "@/lib/db/prisma"
import { adaptGaoxinHealthRecord } from "@/lib/health-record"

export default async function GaoxinHealthRecordPage() {
  const resident = await prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      healthTags: true,
      healthSummaries: { orderBy: { createdAt: "desc" } },
      medicalRecords: { orderBy: { visitDate: "desc" } },
      diagnoses: true,
      medications: true,
      labResults: true,
      allergies: true,
      healthTasks: { orderBy: { createdAt: "desc" } },
    },
  })
  const data = adaptGaoxinHealthRecord(resident)

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="HEALTH_RECORD_VIEW"
        eventName="查看全民健康档案"
        content={data.member.name}
        targetType="health_record"
      />
      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <UserRound className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-950">全民健康档案</h1>
              <p className="mt-1 text-xs text-slate-500">
                当前成员：{data.member.name} · {data.member.community}
              </p>
            </div>
          </div>
          <button type="button" className="inline-flex h-8 items-center gap-1 rounded-full bg-slate-50 px-3 text-xs font-medium text-slate-600">
            家庭成员
            <ChevronDown className="size-3" />
          </button>
        </div>
      </section>

      <GaoxinHealthCard
        name={data.member.name}
        maskedId={data.member.maskedId}
        maskedPhone={data.member.maskedPhone}
        relation="本人"
        variant="mine"
      />

      <Card title="健康标签">
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {tag}
            </span>
          ))}
        </div>
      </Card>

      <Card title="数据来源概览" icon={<Building2 className="size-4 text-emerald-600" />}>
        <p className="mb-3 text-sm leading-6 text-slate-600">
          系统已为您整理来自医院、社区卫生服务中心、体检和随访的健康记录。
        </p>
        <div className="grid grid-cols-2 gap-2">
          <OverviewMetric label="已整理就诊记录" value={`${data.dataOverview.medicalRecordCount} 条`} icon={<ClipboardList className="size-4" />} />
          <OverviewMetric label="涉及医疗机构" value={`${data.dataOverview.institutionCount} 家`} icon={<Building2 className="size-4" />} />
          <OverviewMetric label="检查检验记录" value={`${data.dataOverview.labResultCount} 条`} icon={<FlaskConical className="size-4" />} />
          <OverviewMetric label="用药记录" value={`${data.dataOverview.medicationCount} 条`} icon={<Pill className="size-4" />} />
          <OverviewMetric label="社区随访记录" value={`${data.dataOverview.communityFollowUpCount} 条`} icon={<FileHeart className="size-4" />} />
        </div>
      </Card>

      <Card title="健康档案摘要" icon={<FileHeart className="size-4 text-emerald-600" />}>
        <p className="text-sm leading-6 text-slate-600">{data.residentSummary}</p>
        <details className="mt-3 rounded-2xl bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            就医前摘要（给医生参考）
          </summary>
          <p className="mt-2 text-sm leading-6 text-slate-600">{data.doctorSummary}</p>
        </details>
      </Card>

      <Card title="跨机构记录时间线">
        <div className="space-y-3">
          {data.timeline.map((item) => (
            <div key={item.id} className="border-l-2 border-emerald-100 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {item.category}
                </span>
                <p className="text-sm font-semibold text-slate-900">{item.date} · {item.institutionName}</p>
              </div>
              <p className="mt-1 text-xs text-emerald-700">{item.departmentName}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.summary}</p>
            </div>
          ))}
          <div className="border-l-2 border-emerald-100 pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                健康任务
              </span>
              <p className="text-sm font-semibold text-slate-900">持续更新 · 健康高新</p>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              系统会结合预问诊、报告解读和社区随访，为您生成健康管理提醒。
            </p>
          </div>
        </div>
      </Card>

      <Card title="健康档案如何被使用">
        <div className="grid gap-2">
          {data.usageItems.map((item) => (
            <p key={item} className="rounded-2xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
              {item}
            </p>
          ))}
        </div>
      </Card>

      <Card title="居民版健康关注点">
        <List items={data.attentionItems} fallback="暂无需要特别关注的信息。" />
      </Card>

      <Card title="用药摘要">
        <List items={data.medications} fallback="暂无长期用药记录。" />
      </Card>
      <Card title="过敏史">
        <List items={data.allergies} fallback="暂无明确过敏记录。" />
      </Card>
      <Card title="检查检验关注点">
        <List items={data.labFocus} fallback="暂无重点异常指标。" />
      </Card>

      <section className="grid grid-cols-3 gap-2 pb-2">
        <Link href="/gaoxin/report-ai" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-emerald-600 text-xs font-semibold text-white">
          <Bot className="size-3.5" />
          AI解读
        </Link>
        <button type="button" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <RefreshCcw className="size-3.5" />
          生成摘要
        </button>
        <Link href="/gaoxin/ai" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          返回 AI健康
        </Link>
      </section>
    </div>
  )
}

function Card({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function List({ items, fallback }: { items: string[]; fallback: string }) {
  return items.length > 0 ? (
    <div className="space-y-2">
      {items.map((item, index) => (
        <p key={`${item}-${index}`} className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          {item}
        </p>
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-500">{fallback}</p>
  )
}

function OverviewMetric({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-emerald-600">
        {icon}
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
