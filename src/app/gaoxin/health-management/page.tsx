import Link from "next/link"
import type { ReactNode } from "react"
import { Activity, BookOpen, HeartPulse, Home, NotebookTabs, PhoneCall } from "lucide-react"

import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { prisma } from "@/lib/db/prisma"
import { chronicCards, healthTasks, scienceItems } from "@/lib/gaoxin/health-management-mock"
import { cn } from "@/lib/utils"

export default async function GaoxinHealthManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab ?? "blood-pressure"
  const generatedTasks = await prisma.healthTask.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      resident: true,
    },
  })

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="HEALTH_TASK_VIEW"
        eventName="查看健康管理"
        content={`健康管理-${activeTab}`}
        targetType="health_management"
      />
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#0f766e,#38bdf8)] p-5 text-white shadow-sm">
        <p className="text-sm text-emerald-50">健康管理</p>
        <h1 className="mt-2 text-2xl font-semibold">慢病随访与健康任务</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          管理血压、血糖、复诊提醒和社区随访。
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        {chronicCards.map((item) => (
          <div key={item.title} className="rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{item.desc}</p>
          </div>
        ))}
      </section>

      <Card title="今日健康任务" icon={<NotebookTabs className="size-4 text-emerald-600" />}>
        <div className="space-y-2">
          {healthTasks.map((task) => (
            <div
              key={`${task.key}-${task.title}`}
              className={cn(
                "rounded-2xl p-3 ring-1",
                activeTab === task.key ? "bg-emerald-50 ring-emerald-100" : "bg-slate-50 ring-slate-100"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-emerald-700">
                  {task.status}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{task.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {generatedTasks.length > 0 ? (
        <Card title="AI导诊生成的健康任务" icon={<NotebookTabs className="size-4 text-emerald-600" />}>
          <div className="space-y-2">
            {generatedTasks.map((task) => (
              <div key={task.id} className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {task.resident.name} · {task.title}
                  </p>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-emerald-700">
                    {task.status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {task.description ?? "由小高健康助手根据预问诊场景生成。"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card title="血压记录卡" icon={<HeartPulse className="size-4 text-emerald-600" />} active={activeTab === "blood-pressure"}>
        <Metric value="138/86 mmHg" desc="最近一次记录，建议连续 7 天观察趋势。" />
      </Card>
      <Card title="血糖记录卡" icon={<Activity className="size-4 text-emerald-600" />} active={activeTab === "blood-sugar"}>
        <Metric value="7.1 mmol/L" desc="空腹血糖偏高，建议按计划复查。" />
      </Card>
      <Card title="智能随访卡" icon={<PhoneCall className="size-4 text-emerald-600" />} active={activeTab === "follow-up"}>
        <Metric value="桂溪社区卫生服务中心" desc="可联系社区卫生服务中心完成慢病随访。" />
      </Card>
      <Card title="健康科普卡" icon={<BookOpen className="size-4 text-emerald-600" />} active={activeTab === "body-check"}>
        <div className="space-y-2">
          {scienceItems.map((item) => (
            <p key={item} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              {item}
            </p>
          ))}
        </div>
      </Card>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Home className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">社区卫生服务中心推荐</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              建议优先联系桂溪社区卫生服务中心或签约家庭医生，完成血压血糖随访和复诊提醒。
            </p>
            <Link href="/gaoxin/resources" className="mt-3 inline-flex h-9 items-center rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white">
              查看社区资源
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Card({
  title,
  icon,
  active = false,
  children,
}: {
  title: string
  icon: ReactNode
  active?: boolean
  children: ReactNode
}) {
  return (
    <section className={cn("rounded-[26px] bg-white p-4 shadow-sm ring-1", active ? "ring-emerald-200" : "ring-slate-100")}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Metric({ value, desc }: { value: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  )
}
