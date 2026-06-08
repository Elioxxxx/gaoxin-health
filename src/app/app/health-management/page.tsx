import { Activity, CalendarClock, Droplet, HeartPulse, Newspaper, Stethoscope } from "lucide-react"

import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db/prisma"

export default async function HealthManagementPage() {
  const residents = await prisma.residentProfile.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      healthTasks: { orderBy: { createdAt: "desc" } },
      healthTags: true,
    },
  })
  const resident = residents[0]

  const tasks = resident?.healthTasks ?? []
  const allTasks = residents.flatMap((item) =>
    item.healthTasks.map((task) => ({ ...task, residentName: item.name }))
  )
  const bloodPressureTasks = tasks.filter((task) => task.title.includes("血压"))
  const glucoseTasks = tasks.filter((task) => task.title.includes("血糖"))
  const followUpTasks = tasks.filter(
    (task) => task.title.includes("复诊") || task.title.includes("随访")
  )

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-emerald-700 p-5 text-white">
        <p className="text-sm text-emerald-100">健康管理</p>
        <h1 className="mt-2 text-2xl font-semibold">慢病随访与健康任务</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          面向家庭医生签约、慢病复诊和健康风险管理。
        </p>
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartPulse className="size-4 text-emerald-600" />
            慢病管理卡片
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-slate-600">
            当前居民：{resident?.name ?? "未选择"}。系统会根据预问诊结果和健康档案生成随访任务。
          </p>
          <div className="flex flex-wrap gap-1.5">
            {resident?.healthTags.map((tag) => (
              <HealthTagBadge key={tag.id}>{tag.name}</HealthTagBadge>
            ))}
          </div>
        </CardContent>
      </Card>

      <TaskSection
        title="血压记录任务"
        icon={Activity}
        fallback="暂无血压记录任务。"
        tasks={bloodPressureTasks}
      />
      <TaskSection
        title="血糖复查任务"
        icon={Droplet}
        fallback="暂无血糖复查任务。"
        tasks={glucoseTasks}
      />
      <TaskSection
        title="复诊提醒"
        icon={CalendarClock}
        fallback="暂无复诊提醒。"
        tasks={followUpTasks}
      />

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4 text-emerald-600" />
            演示居民健康任务
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {allTasks.length > 0 ? (
            allTasks.slice(0, 12).map((task) => (
              <div key={task.id} className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">
                    {task.residentName} · {task.title}
                  </p>
                  <HealthTagBadge tone="emerald">{task.status}</HealthTagBadge>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{task.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">暂无健康管理任务。</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="size-4 text-emerald-600" />
            随访建议
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-600">
          建议按家庭医生或专科医生意见完成复查、用药调整和生活方式干预。
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="size-4 text-emerald-600" />
            健康科普入口
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          {["高血压控压要点", "血糖复查怎么做", "儿童发热观察", "胸痛就医流程"].map(
            (item) => (
              <div key={item} className="rounded-lg bg-emerald-50 p-3 text-emerald-800">
                {item}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TaskSection({
  title,
  icon: Icon,
  tasks,
  fallback,
}: {
  title: string
  icon: typeof Activity
  tasks: Array<{ id: string; title: string; status: string; description?: string | null; dueDate?: Date | null }>
  fallback: string
}) {
  return (
    <Card className="rounded-lg border-emerald-100 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-emerald-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">{task.title}</p>
                <HealthTagBadge tone="emerald">{task.status}</HealthTagBadge>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {task.description}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">{fallback}</p>
        )}
      </CardContent>
    </Card>
  )
}
