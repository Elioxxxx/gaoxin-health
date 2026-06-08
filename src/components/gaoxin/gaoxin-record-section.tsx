import {
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileSearch,
  HandHeart,
  HeartPulse,
  NotebookTabs,
  Stethoscope,
} from "lucide-react"

import { GaoxinServiceIcon } from "@/components/gaoxin/gaoxin-service-icon"

export function GaoxinRecordSection({
  aiCount,
  guideCount,
  taskCount,
}: {
  aiCount: number
  guideCount: number
  taskCount: number
}) {
  const items = [
    { title: "挂号记录", href: "/gaoxin/records?type=registration", icon: CalendarCheck },
    { title: "缴费记录", href: "/gaoxin/records?type=payment", icon: CreditCard },
    { title: "报告记录", href: "/gaoxin/records?type=report", icon: FileSearch, badge: "1" },
    { title: "签约记录", href: "/gaoxin/records?type=family-doctor", icon: HandHeart },
    { title: "随访记录", href: "/gaoxin/records?type=follow-up", icon: ClipboardList },
    { title: "AI问诊记录", href: "/gaoxin/records?type=ai", icon: Stethoscope, badge: aiCount > 0 ? String(aiCount) : "新增" },
    { title: "导诊记录", href: "/gaoxin/records?type=guide", icon: NotebookTabs, badge: guideCount > 0 ? String(guideCount) : "新增" },
    { title: "健康任务", href: "/gaoxin/records?type=task", icon: HeartPulse, badge: taskCount > 0 ? String(taskCount) : "新增" },
  ]

  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-4 text-base font-semibold text-slate-950">我的记录</h2>
      <div className="grid grid-cols-4 gap-x-2 gap-y-4">
        {items.map((item) => (
          <GaoxinServiceIcon key={item.title} {...item} tone="emerald" />
        ))}
      </div>
    </section>
  )
}
