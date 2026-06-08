"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, CheckCircle2, Clock3, Hospital, Lightbulb, ListChecks, MousePointerClick, ShieldCheck } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-section"
import { IntentRankingChart } from "@/components/admin/intent-ranking-chart"
import { IntentStatCard } from "@/components/admin/intent-stat-card"
import { LeadFlowChart } from "@/components/admin/lead-flow-chart"
import { ServiceLeadTable, type AdminServiceLead } from "@/components/admin/service-lead-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type IntentInsight = {
  id: string
  intentType: string
  title: string
  summary: string
  priority: string
  resident: { name: string; community?: string }
}

type DashboardPayload = {
  insights: IntentInsight[]
  leads: AdminServiceLead[]
  stats: {
    insightCount: number
    leadCount: number
    eventCount: number
    byIntentType: Record<string, number>
    byLeadReceiver: Record<string, number>
    hotQuestions: Array<[string, number]>
  }
}

const intentLabels: Record<string, string> = {
  ACUTE_CARE_INTENT: "胸闷胸痛",
  SPECIALTY_CARE_INTENT: "专科就医",
  CHRONIC_DISEASE_MANAGEMENT: "高血压复诊",
  REPORT_INTERPRETATION: "报告解读",
  FAMILY_DOCTOR_SIGNUP: "家医签约",
  CHILD_HEALTH: "儿童发热",
  MATERNAL_HEALTH: "孕产妇",
  ELDERLY_HEALTH: "老年健康",
  HEALTH_ANXIETY: "健康焦虑",
  SERVICE_DROPOFF: "服务流失",
  MEDICATION_SAFETY: "用药安全",
  PUBLIC_HEALTH_FOLLOWUP: "公卫随访",
}

export function IntentInsightDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null)

  useEffect(() => {
    fetch("/api/admin/intent-insights")
      .then((response) => response.json())
      .then((payload: { data: DashboardPayload }) => setData(payload.data))
      .catch(() => setData({ insights: [], leads: [], stats: { insightCount: 0, leadCount: 0, eventCount: 0, byIntentType: {}, byLeadReceiver: {}, hotQuestions: [] } }))
  }, [])

  const derived = useMemo(() => {
    const leads = data?.leads ?? []
    const hospitalLeads = leads.filter((item) => item.receiverType === "HOSPITAL")
    const communityLeads = leads.filter((item) => item.receiverType === "COMMUNITY_HEALTH_CENTER")
    const commissionLeads = leads.filter((item) => item.receiverType === "HEALTH_COMMISSION")
    const handled = leads.filter((item) => ["CONTACTED", "FOLLOWUP_ADDED", "CLOSED", "TRANSFERRED"].includes(item.status)).length
    const pending = leads.filter((item) => ["PENDING", "VIEWED"].includes(item.status)).length
    const ranking = normalizeRanking(data?.stats.byIntentType ?? {})
    const flow = [
      { name: "医院", value: hospitalLeads.length },
      { name: "社区卫生服务中心", value: communityLeads.length },
      { name: "卫健端", value: commissionLeads.length },
    ]

    return { leads, hospitalLeads, communityLeads, commissionLeads, handled, pending, ranking, flow }
  }, [data])

  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="居民意图与服务线索" description="正在加载区域健康需求洞察..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="居民意图与服务线索"
        description="基于居民端行为识别医院、社区、卫健可承接的服务机会，支撑区域健康需求洞察、基层承接和科普推送。"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <IntentStatCard title="本周用户行为事件数" value={data.stats.eventCount} icon={MousePointerClick} tone="indigo" />
        <IntentStatCard title="识别服务意图数" value={data.stats.insightCount} icon={Lightbulb} tone="amber" />
        <IntentStatCard title="生成服务线索数" value={data.stats.leadCount} icon={ListChecks} tone="sky" />
        <IntentStatCard title="医院线索数" value={derived.hospitalLeads.length} icon={Hospital} tone="sky" />
        <IntentStatCard title="社区线索数" value={derived.communityLeads.length} icon={Building2} tone="emerald" />
        <IntentStatCard title="卫健线索数" value={derived.commissionLeads.length} icon={ShieldCheck} tone="indigo" />
        <IntentStatCard title="已处理线索数" value={derived.handled} icon={CheckCircle2} tone="emerald" />
        <IntentStatCard title="待处理线索数" value={derived.pending} icon={Clock3} tone="rose" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <IntentRankingChart data={derived.ranking} />
        <LeadFlowChart data={derived.flow} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ServiceLeadTable title="医院服务线索" leads={derived.hospitalLeads} defaultReceiverType="HOSPITAL" />
        <ServiceLeadTable title="社区服务线索" leads={derived.communityLeads} defaultReceiverType="COMMUNITY_HEALTH_CENTER" />
      </section>

      <OperationalInsightCard hotQuestions={data.stats.hotQuestions} />

      <ServiceLeadTable title="线索明细表" leads={derived.leads} />
    </div>
  )
}

function normalizeRanking(byIntentType: Record<string, number>) {
  const defaults = [
    "CHRONIC_DISEASE_MANAGEMENT",
    "CHILD_HEALTH",
    "REPORT_INTERPRETATION",
    "ACUTE_CARE_INTENT",
    "MEDICATION_SAFETY",
    "FAMILY_DOCTOR_SIGNUP",
    "HEALTH_ANXIETY",
  ]
  const merged = new Map(defaults.map((key) => [intentLabels[key], byIntentType[key] ?? 0]))

  for (const [key, value] of Object.entries(byIntentType)) {
    merged.set(intentLabels[key] ?? key, value)
  }

  return Array.from(merged.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

function OperationalInsightCard({ hotQuestions }: { hotQuestions: Array<[string, number]> }) {
  const suggestions = [
    "本周儿童发热相关咨询较多，建议推送儿童发热观察指南。",
    "高血压复诊意图集中在桂溪、芳草片区，建议社区家庭医生团队加强随访提醒。",
    "生成导诊但未预约的用户较多，建议优化预约跳转和导诊解释。",
    "用药安全相关问题持续出现，建议发布抗生素合理使用科普内容。",
  ]

  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base">卫健运营洞察</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">高频问题</h3>
          <div className="mt-3 space-y-2">
            {hotQuestions.slice(0, 6).map(([question, count]) => (
              <div key={question} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                {question}
                <span className="ml-2 text-xs text-slate-400">{count} 次</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">异常增长提示</h3>
          <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            报告解读、儿童发热和慢病复诊意图较集中，建议结合季节变化和社区服务能力安排科普推送。
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">科普与资源建议</h3>
          <div className="mt-3 space-y-2">
            {suggestions.map((item) => (
              <p key={item} className="rounded-md bg-indigo-50 p-3 text-sm leading-6 text-indigo-800">
                {item}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
