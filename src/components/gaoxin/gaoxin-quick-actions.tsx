import { CalendarCheck, CreditCard, FileSearch, HandHeart } from "lucide-react"

import { GaoxinServiceIcon } from "@/components/gaoxin/gaoxin-service-icon"

const quickActions = [
  { label: "预约挂号", href: "/gaoxin/resources", icon: CalendarCheck, tone: "emerald" as const },
  { label: "在线缴费", href: "/gaoxin/records?type=payment", icon: CreditCard, tone: "cyan" as const },
  { label: "家医签约", href: "/gaoxin/health-management", icon: HandHeart, tone: "sky" as const },
  { label: "报告查询", href: "/gaoxin/report-ai", icon: FileSearch, tone: "amber" as const },
]

export function GaoxinQuickActions() {
  return (
    <section className="rounded-[24px] bg-white px-3 py-4 shadow-sm ring-1 ring-slate-100">
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((item) => (
          <GaoxinServiceIcon key={item.label} {...item} />
        ))}
      </div>
    </section>
  )
}
