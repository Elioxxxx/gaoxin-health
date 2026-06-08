import { Activity, FileHeart, FileSearch, HeartPulse, NotebookTabs, Smartphone } from "lucide-react"

import { GaoxinServiceIcon } from "@/components/gaoxin/gaoxin-service-icon"

export function GaoxinDataSection() {
  const items = [
    { title: "健康档案", href: "/gaoxin/health-record", icon: FileHeart, tone: "emerald" as const },
    { title: "血压记录", href: "/gaoxin/health-management?tab=blood-pressure", icon: HeartPulse, tone: "cyan" as const },
    { title: "血糖记录", href: "/gaoxin/health-management?tab=blood-sugar", icon: Activity, tone: "sky" as const },
    { title: "健康体测", href: "/gaoxin/health-management?tab=body-check", icon: Smartphone, tone: "violet" as const },
    { title: "报告解读记录", href: "/gaoxin/records?type=report-ai", icon: FileSearch, tone: "amber" as const },
    { title: "慢病管理", href: "/gaoxin/health-management", icon: NotebookTabs, tone: "emerald" as const },
  ]

  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-4 text-base font-semibold text-slate-950">我的健康数据</h2>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {items.map((item) => (
          <GaoxinServiceIcon key={item.title} {...item} />
        ))}
      </div>
    </section>
  )
}
