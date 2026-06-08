"use client"

import {
  Camera,
  FileHeart,
  Hospital,
  NotebookTabs,
  Stethoscope,
  UsersRound,
} from "lucide-react"

import { GaoxinServiceIcon } from "@/components/gaoxin/gaoxin-service-icon"
import { trackUserAction } from "@/lib/intent/client-action"

const capabilities = [
  { title: "AI导诊", href: "/gaoxin/pre-consult", icon: Stethoscope, tone: "emerald" as const },
  { title: "拍报告", href: "/gaoxin/report-ai", icon: Camera, tone: "violet" as const },
  { title: "就医服务", href: "/gaoxin/resources", icon: Hospital, tone: "sky" as const },
  { title: "健康档案", href: "/gaoxin/health-record", icon: FileHeart, tone: "cyan" as const },
  { title: "慢病管理", href: "/gaoxin/health-management", icon: NotebookTabs, tone: "emerald" as const },
  { title: "找医院医生", href: "/gaoxin/resources", icon: UsersRound, tone: "amber" as const },
]

export function AiCapabilityGrid() {
  return (
    <section className="rounded-[26px] bg-white/90 p-4 shadow-sm ring-1 ring-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">快捷能力</h2>
        <span className="text-xs font-medium text-emerald-600">健康高新接入</span>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {capabilities.map((item) => (
          <GaoxinServiceIcon
            key={item.title}
            {...item}
            onSelect={() =>
              trackUserAction({
                eventType: resolveCapabilityEventType(item.title, item.href),
                eventName: `点击${item.title}`,
                content: item.title,
                targetType: "ai_capability",
                metadata: { href: item.href },
              })
            }
          />
        ))}
      </div>
    </section>
  )
}

function resolveCapabilityEventType(title: string, href: string) {
  if (title.includes("AI导诊") || href.includes("pre-consult")) {
    return "AI_CHAT"
  }
  if (title.includes("报告") || href.includes("report-ai")) {
    return "REPORT_VIEW"
  }
  if (title.includes("健康档案") || href.includes("health-record")) {
    return "HEALTH_RECORD_VIEW"
  }
  if (title.includes("慢病") || href.includes("health-management")) {
    return "HEALTH_TASK_VIEW"
  }
  return "RESOURCE_VIEW"
}
