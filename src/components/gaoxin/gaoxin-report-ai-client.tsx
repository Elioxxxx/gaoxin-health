"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Camera, FileSearch, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { reportAiOptions, type ReportAiOption } from "@/lib/gaoxin/report-ai-mock"
import { trackUserAction } from "@/lib/intent/client-action"
import { cn } from "@/lib/utils"

export function GaoxinReportAiClient() {
  return (
    <Suspense fallback={<div className="rounded-[24px] bg-white p-4 text-sm text-slate-500">正在加载报告解读...</div>}>
      <GaoxinReportAiContent />
    </Suspense>
  )
}

function GaoxinReportAiContent() {
  const searchParams = useSearchParams()
  const question = searchParams.get("input")
  const [selected, setSelected] = useState<ReportAiOption>(reportAiOptions[0])
  const [result, setResult] = useState<ReportAiOption | null>(null)

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="REPORT_VIEW"
        eventName="进入AI报告解读"
        content={question ?? "查看报告解读页面"}
        targetType="report_ai"
      />
      {question ? (
        <section className="rounded-[24px] bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 ring-1 ring-emerald-100">
          来自小高健康助手的问题：{question}
        </section>
      ) : null}

      <section className="rounded-[28px] bg-[linear-gradient(135deg,#ecfdf5,#eef2ff)] p-5 shadow-sm ring-1 ring-white">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <FileSearch className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">AI报告解读</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              可选择已有报告或上传报告图片，小高健康助手将提取重点指标并给出就医建议。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-semibold text-slate-950">选择已有报告</h2>
        <div className="mt-3 grid gap-2">
          {reportAiOptions.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setSelected(item)
                trackUserAction({
                  eventType: "REPORT_VIEW",
                  eventName: "选择已有报告",
                  content: item.title,
                  targetType: "report",
                  targetId: item.key,
                })
              }}
              className={cn(
                "rounded-2xl px-3 py-3 text-left text-sm font-semibold ring-1",
                selected.key === item.key
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-slate-50 text-slate-700 ring-slate-100"
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" className="mt-3 h-10 w-full rounded-full">
          <Camera className="size-4" />
          上传报告图片
        </Button>
        <Button
          type="button"
          onClick={() => {
            setResult(selected)
            trackUserAction({
              eventType: "REPORT_INTERPRET",
              eventName: "开始报告解读",
              content: selected.title,
              targetType: "report",
              targetId: selected.key,
            })
          }}
          className="mt-3 h-11 w-full rounded-full bg-emerald-600 text-white"
        >
          开始解读
        </Button>
      </section>

      {result ? (
        <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-base font-semibold text-slate-950">Mock 解读结果</h2>
          <div className="mt-3 space-y-3 text-sm">
            <Info label="报告摘要" value={result.summary} />
            <Block label="异常指标" items={result.abnormalItems} />
            <Block label="建议关注问题" items={result.concerns} />
            <Info label="建议科室" value={result.department} />
            <Info label="是否建议复查" value={result.recheck} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link href="/gaoxin/pre-consult" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-emerald-600 text-xs font-semibold text-white">
              <Stethoscope className="size-3.5" />
              AI导诊
            </Link>
            <Link href="/gaoxin/health-record" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              健康档案
            </Link>
            <Link href="/gaoxin/resources" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
              预约挂号
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 leading-6 text-slate-700">{value}</p>
    </div>
  )
}

function Block({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-100">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
