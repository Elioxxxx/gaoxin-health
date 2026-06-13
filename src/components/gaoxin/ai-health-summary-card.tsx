"use client"

import Link from "next/link"
import { Activity, Bed, ClipboardCheck, Footprints } from "lucide-react"

import type { GaoxinHealthSummaryView } from "@/lib/health-record"
import { trackUserAction } from "@/lib/intent/client-action"

export function AiHealthSummaryCard({
  summary,
}: {
  summary: GaoxinHealthSummaryView
}) {
  return (
    <section className="rounded-[26px] bg-white/90 p-4 shadow-sm ring-1 ring-white">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">我的健康</h2>
          <p className="mt-1 text-xs text-slate-400">更新于 {summary.updatedAt}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          健康摘要
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {summary.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric icon={Footprints} label="步数" value={summary.steps} />
        <Metric icon={Bed} label="睡眠时长" value={summary.sleep} />
        <Metric icon={ClipboardCheck} label="慢病任务" value={summary.chronicTaskText} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <InfoPill label="已整理健康记录" value={`${summary.organizedRecordCount} 条`} />
        <InfoPill label="涉及医疗机构" value={`${summary.institutionCount} 家`} />
        <InfoPill label="待完成健康任务" value={`${summary.pendingTaskCount} 项`} />
        <InfoPill label="最近关注" value={summary.recentFocus} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/gaoxin/health-record"
          onClick={() =>
            trackUserAction({
              eventType: "HEALTH_RECORD_VIEW",
              eventName: "AI健康查看健康档案",
              content: "查看健康档案",
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white"
        >
          查看健康档案
        </Link>
        <Link
          href="/gaoxin/health-management"
          onClick={() =>
            trackUserAction({
              eventType: "HEALTH_TASK_VIEW",
              eventName: "AI健康查看健康任务",
              content: "查看健康任务",
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-full bg-slate-50 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100"
        >
          查看健康任务
        </Link>
      </div>
    </section>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-emerald-50 px-3 py-2">
      <p className="text-[11px] text-emerald-700/70">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-emerald-800">{value}</p>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <Icon className="size-4 text-emerald-600" />
      <p className="mt-2 text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
