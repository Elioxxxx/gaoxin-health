import { Bell, BookOpenText, CircleHelp, FileText, Info, ShieldX } from "lucide-react"

import { GaoxinDataSection } from "@/components/gaoxin/gaoxin-data-section"
import { GaoxinHealthCard } from "@/components/gaoxin/gaoxin-health-card"
import { GaoxinMineHeader } from "@/components/gaoxin/gaoxin-mine-header"
import { GaoxinRecordSection } from "@/components/gaoxin/gaoxin-record-section"
import { GaoxinServiceIcon } from "@/components/gaoxin/gaoxin-service-icon"
import { prisma } from "@/lib/db/prisma"

const toolItems = [
  { title: "消息中心", href: "/gaoxin/records?type=tool", icon: Bell },
  { title: "政策法规", href: "/gaoxin/records?type=tool", icon: BookOpenText },
  { title: "常见疑问", href: "/gaoxin/records?type=tool", icon: CircleHelp },
  { title: "帮助指南", href: "/gaoxin/records?type=tool", icon: FileText },
  { title: "关于我们", href: "/gaoxin/records?type=tool", icon: Info },
  { title: "账号注销", href: "/gaoxin/records?type=tool", icon: ShieldX },
]

export default async function GaoxinMinePage() {
  const resident = await prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      healthTasks: true,
    },
  })
  const aiCount = resident
    ? await prisma.preConsultSession.count({ where: { residentId: resident.id } })
    : 0
  const guideCount = resident
    ? await prisma.guidePlan.count({ where: { session: { residentId: resident.id } } })
    : 0
  const taskCount = resident?.healthTasks.length ?? 1
  const displayName = resident?.name ?? "张建国"
  const maskedId = "5101********1217"
  const maskedPhone = maskPhone(resident?.phone ?? "13800000001")

  return (
    <div className="space-y-3">
      <section className="-mx-3 -mt-1 bg-[linear-gradient(180deg,#e7fbf4_0%,#f5f6f8_72%)] px-3 pb-1 pt-3">
        <div className="space-y-3">
          <GaoxinMineHeader name={displayName} maskedId={maskedId} />
          <GaoxinHealthCard
            name={displayName}
            maskedId={maskedId}
            maskedPhone={maskedPhone}
            relation="本人"
            variant="mine"
          />
        </div>
      </section>

      <GaoxinRecordSection aiCount={aiCount} guideCount={guideCount} taskCount={taskCount} />
      <GaoxinDataSection />

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 text-base font-semibold text-slate-950">常用工具</h2>
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {toolItems.map((item) => (
            <GaoxinServiceIcon key={item.title} {...item} tone="slate" />
          ))}
        </div>
      </section>
    </div>
  )
}

function maskPhone(phone: string) {
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : "138****0001"
}
