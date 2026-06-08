import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { DoctorTriageBadge } from "@/components/doctor/doctor-badges"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type WorklistItem = {
  id: string
  name: string
  age: number
  gender: string
  caseSummary?: string | null
  primaryScenario?: string | null
  healthTags: Array<{ id: string; name: string }>
  doctorProfiles: Array<{ id: string }>
  intentInsights: Array<{
    id: string
    intentType: string
    title: string
    priority: string
  }>
  serviceLeads: Array<{ id: string; status: string }>
  sessions: Array<{
    id: string
    initialInput: string
    report?: { chiefComplaint: string } | null
    triageResult?: {
      level: string
      suggestedDepartment: string
      reasons: string
    } | null
    recommendations: Array<{
      institution: { name: string }
      department: { name: string }
      doctor?: { name: string } | null
      reasons: string
    }>
  }>
}

const intentLabels: Record<string, string> = {
  ACUTE_CARE_INTENT: "急性就医",
  SPECIALTY_CARE_INTENT: "专科就医",
  CHRONIC_DISEASE_MANAGEMENT: "慢病管理",
  REPORT_INTERPRETATION: "报告解读",
  FAMILY_DOCTOR_SIGNUP: "家医签约",
  CHILD_HEALTH: "儿童健康",
  MATERNAL_HEALTH: "孕产妇",
  ELDERLY_HEALTH: "老年健康",
  HEALTH_ANXIETY: "健康焦虑",
  SERVICE_DROPOFF: "就医延迟",
  MEDICATION_SAFETY: "用药安全",
  PUBLIC_HEALTH_FOLLOWUP: "公卫随访",
}

export function WorklistTable({ items }: { items: WorklistItem[] }) {
  const sorted = [...items].sort((a, b) => {
    const order: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }
    const aLevel = a.sessions[0]?.triageResult?.level ?? "P4"
    const bLevel = b.sessions[0]?.triageResult?.level ?? "P4"
    const aLead = a.serviceLeads.length > 0 ? -1 : 0
    const bLead = b.serviceLeads.length > 0 ? -1 : 0

    return (
      aLead - bLead ||
      (order[aLevel] ?? 9) - (order[bLevel] ?? 9) ||
      a.name.localeCompare(b.name, "zh-CN")
    )
  })

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="min-w-36">患者</TableHead>
              <TableHead className="min-w-44">本次主诉</TableHead>
              <TableHead>分诊</TableHead>
              <TableHead className="min-w-40">推荐科室</TableHead>
              <TableHead className="min-w-56">健康档案与问题标签</TableHead>
              <TableHead className="min-w-44">服务意图</TableHead>
              <TableHead>待处理线索</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => {
              const session = item.sessions[0]
              const recommendation = session?.recommendations[0]
              const triage = session?.triageResult
              const chiefComplaint =
                session?.report?.chiefComplaint ?? session?.initialInput ?? item.primaryScenario ?? "暂无预问诊主诉"
              const tags = item.healthTags.slice(0, 3)
              const intents = item.intentInsights.slice(0, 2)

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium text-slate-950">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      {item.age}岁 / {item.gender}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 whitespace-normal text-sm leading-5 text-slate-600">
                    {chiefComplaint}
                  </TableCell>
                  <TableCell>
                    <DoctorTriageBadge level={triage?.level} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {triage?.suggestedDepartment ?? recommendation?.department.name ?? item.primaryScenario ?? "待评估"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {recommendation?.institution.name ?? "医生版健康档案"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="mb-2">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                        {item.doctorProfiles.length > 0 ? "已生成医生版健康档案" : "待生成医生版健康档案"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {intents.length > 0 ? (
                        intents.map((intent) => (
                          <Badge key={intent.id} className="bg-sky-50 text-sky-700 hover:bg-sky-50">
                            {intentLabels[intent.intentType] ?? intent.title}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">暂无意图洞察</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      {item.serviceLeads.length} 条
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/doctor/patients/${item.id}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      查看详情
                      <ChevronRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
