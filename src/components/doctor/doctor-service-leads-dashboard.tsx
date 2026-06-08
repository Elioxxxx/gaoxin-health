"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, ShieldAlert, Stethoscope, UsersRound } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  intentTypeLabels,
  leadTypeLabels,
  priorityClasses,
  priorityLabels,
  receiverTypeLabels,
} from "@/components/doctor/doctor-panel-utils"

export type DoctorServiceLeadItem = {
  id: string
  receiverType: string
  leadType: string
  title: string
  summary: string
  suggestedAction: string
  priority: string
  status: string
  createdAt: string
  resident: {
    id: string
    name: string
    age: number
    gender: string
    community?: string | null
    healthTags?: Array<{ id: string; name: string }>
    userActionEvents?: Array<{
      id: string
      eventName: string
      content?: string | null
      pagePath: string
      occurredAt: string
    }>
  }
  intentInsight?: {
    id: string
    intentType: string
    summary: string
    suggestedAction: string
  } | null
  receiverInstitution?: { id: string; name: string } | null
  receiverDepartment?: { id: string; name: string } | null
}

type FilterKey =
  | "all"
  | "hospital"
  | "community"
  | "chronic"
  | "report"
  | "familyDoctor"
  | "medication"
  | "child"

const statusLabels: Record<string, string> = {
  PENDING: "待联系",
  VIEWED: "已查看",
  CONTACTED: "已联系",
  FOLLOWUP_ADDED: "已纳入随访",
  TRANSFERRED: "已转派",
  CLOSED: "已关闭",
  IGNORED: "已忽略",
}

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "全部" },
  { key: "hospital", label: "医院线索" },
  { key: "community", label: "社区线索" },
  { key: "chronic", label: "慢病管理" },
  { key: "report", label: "报告解读" },
  { key: "familyDoctor", label: "家医签约" },
  { key: "medication", label: "用药安全" },
  { key: "child", label: "儿童健康" },
]

const priorityOrder: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

export function DoctorServiceLeadsDashboard({ leads }: { leads: DoctorServiceLeadItem[] }) {
  const [items, setItems] = useState(leads)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [message, setMessage] = useState("")

  const stats = useMemo(() => {
    const hospital = items.filter((item) => item.receiverType === "HOSPITAL").length
    const community = items.filter((item) => item.receiverType === "COMMUNITY_HEALTH_CENTER").length
    const highPriority = items.filter((item) => ["URGENT", "HIGH"].includes(item.priority)).length
    const pending = items.filter((item) => ["PENDING", "VIEWED"].includes(item.status)).length
    const followUp = items.filter((item) => item.status === "FOLLOWUP_ADDED").length

    return { hospital, community, highPriority, pending, followUp }
  }, [items])

  const visible = useMemo(
    () =>
      items
        .filter((item) => matchFilter(item, filter))
        .sort(
          (a, b) =>
            (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [filter, items]
  )

  async function updateStatus(id: string, status: string, feedbackType: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)))
    setMessage("")

    const response = await fetch(`/api/doctor/service-leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (response.ok) {
      await fetch(`/api/doctor/service-leads/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorRole: "DOCTOR",
          operatorName: "医生端演示账号",
          feedbackType,
          comment: `医生端服务线索操作：${feedbackType}`,
        }),
      }).catch(() => undefined)
    }

    setMessage(response.ok ? "线索状态已同步，卫健端可实时查看。" : "状态更新失败，请稍后重试。")
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <LeadStatCard title="医院线索数" value={stats.hospital} icon={Stethoscope} tone="sky" />
        <LeadStatCard title="社区线索数" value={stats.community} icon={UsersRound} tone="emerald" />
        <LeadStatCard title="高优先级线索" value={stats.highPriority} icon={ShieldAlert} tone="rose" />
        <LeadStatCard title="待联系线索" value={stats.pending} icon={ArrowRight} tone="amber" />
        <LeadStatCard title="已纳入随访线索" value={stats.followUp} icon={CheckCircle2} tone="violet" />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={filter === item.key ? "default" : "outline"}
              className={filter === item.key ? "bg-sky-700 hover:bg-sky-800" : ""}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </section>

      {message ? (
        <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        {visible.map((item) => (
          <ServiceLeadCard key={item.id} item={item} onUpdateStatus={updateStatus} />
        ))}
      </section>

      {visible.length === 0 ? (
        <Card className="rounded-lg border-slate-200 bg-white">
          <CardContent className="py-10 text-center text-sm text-slate-500">
            当前筛选条件下暂无服务线索。
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function ServiceLeadCard({
  item,
  onUpdateStatus,
}: {
  item: DoctorServiceLeadItem
  onUpdateStatus: (id: string, status: string, feedbackType: string) => Promise<void>
}) {
  const recentAction = item.resident.userActionEvents?.[0]
  const receiverName =
    item.receiverInstitution?.name ?? receiverTypeLabels[item.receiverType] ?? item.receiverType
  const tags = item.resident.healthTags?.slice(0, 3) ?? []

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-sky-700">
            {intentTypeLabels[item.intentInsight?.intentType ?? ""] ??
              leadTypeLabels[item.leadType] ??
              "服务线索"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            患者：{item.resident.name}，{item.resident.age}岁 / {item.resident.gender}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${priorityClasses[item.priority] ?? priorityClasses.LOW}`}>
            {priorityLabels[item.priority] ?? item.priority}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {statusLabels[item.status] ?? item.status}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <InfoBlock title="线索类型" value={leadTypeLabels[item.leadType] ?? item.leadType} />
        <InfoBlock title="推荐接收方" value={receiverName} />
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <InfoBlock title="触发原因" value={item.summary} />
        <InfoBlock title="系统建议" value={item.suggestedAction} />
        <InfoBlock
          title="最近行为"
          value={
            recentAction
              ? `${recentAction.eventName}：${recentAction.content ?? recentAction.pagePath}`
              : "暂无近期行为记录"
          }
        />
      </div>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag.id} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/doctor/patients/${item.resident.id}`}
          className={buttonVariants({ size: "sm", variant: "default" })}
        >
          查看患者
        </Link>
        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(item.id, "VIEWED", "标记已查看")}>
          标记已查看
        </Button>
        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(item.id, "CONTACTED", "标记已联系")}>
          标记已联系
        </Button>
        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(item.id, "FOLLOWUP_ADDED", "加入随访")}>
          加入随访
        </Button>
        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(item.id, "CLOSED", "关闭")}>
          关闭
        </Button>
      </div>
    </article>
  )
}

function LeadStatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: number
  icon: typeof Stethoscope
  tone: "sky" | "emerald" | "rose" | "amber" | "violet"
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  }

  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
        <div className={`flex size-9 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  )
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="mt-1 leading-6 text-slate-700">{value || "暂无"}</p>
    </div>
  )
}

function matchFilter(item: DoctorServiceLeadItem, filter: FilterKey) {
  if (filter === "all") return true
  if (filter === "hospital") return item.receiverType === "HOSPITAL"
  if (filter === "community") return item.receiverType === "COMMUNITY_HEALTH_CENTER"
  if (filter === "chronic") return item.leadType === "CHRONIC_FOLLOWUP"
  if (filter === "report") return item.leadType === "REPORT_REVIEW"
  if (filter === "familyDoctor") return item.leadType === "FAMILY_DOCTOR"
  if (filter === "medication") return item.leadType === "MEDICATION_SAFETY"
  if (filter === "child") return item.leadType === "CHILD_CARE"
  return true
}
