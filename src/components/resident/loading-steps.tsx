"use client"

import { CheckCircle2, Loader2 } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const defaultSteps = ["结构化问诊", "健康档案摘要", "分诊推荐", "生成导诊"]

export function LoadingSteps({
  activeIndex,
  steps = defaultSteps,
}: {
  activeIndex: number
  steps?: string[]
}) {
  const value = Math.min(100, ((activeIndex + 1) / steps.length) * 100)

  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-emerald-100">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">正在分析</p>
        <span className="text-xs text-emerald-700">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="mb-4" />
      <div className="space-y-2">
        {steps.map((step, index) => {
          const done = index < activeIndex
          const active = index === activeIndex

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-2 text-sm",
                done || active ? "text-emerald-700" : "text-slate-400"
              )}
            >
              {done ? (
                <CheckCircle2 className="size-4" />
              ) : active ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="size-4 rounded-full border border-slate-200" />
              )}
              {step}
            </div>
          )
        })}
      </div>
    </div>
  )
}
