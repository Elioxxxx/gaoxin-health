"use client"

import { usePathname } from "next/navigation"
import { ChevronDown, Circle, MoreHorizontal } from "lucide-react"

const routeTitles: Array<{ prefix: string; title: string }> = [
  { prefix: "/gaoxin/ai", title: "小高健康助手" },
  { prefix: "/gaoxin/mine", title: "个人中心" },
  { prefix: "/gaoxin/pre-consult", title: "智能预问诊" },
  { prefix: "/gaoxin/health-record", title: "健康档案摘要" },
  { prefix: "/gaoxin/resources", title: "医疗资源" },
  { prefix: "/gaoxin/report-ai", title: "报告解读" },
  { prefix: "/gaoxin/health-management", title: "健康管理" },
  { prefix: "/gaoxin/records", title: "我的记录" },
  { prefix: "/gaoxin/videos", title: "健康推荐" },
]

export function GaoxinTopBar({ title }: { title?: string }) {
  const pathname = usePathname()
  const resolvedTitle =
    title ?? routeTitles.find((item) => pathname.startsWith(item.prefix))?.title ?? "健康高新"

  return (
    <header className="sticky top-0 z-30 bg-[#f5f6f8]/95 px-4 pb-2 pt-3 backdrop-blur">
      <div className="grid h-10 grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          className="flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-100"
        >
          选择机构
          <ChevronDown className="size-3.5 text-slate-400" />
        </button>
        <div className="text-base font-semibold tracking-normal text-slate-950">
          {resolvedTitle}
        </div>
        <div className="justify-self-end">
          <div className="flex h-7 w-[78px] items-center justify-center gap-2 rounded-full bg-white/90 shadow-sm ring-1 ring-slate-200">
            <MoreHorizontal className="size-4 text-slate-700" />
            <span className="h-4 w-px bg-slate-200" />
            <Circle className="size-3.5 text-slate-700" />
          </div>
        </div>
      </div>
    </header>
  )
}
