"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatJsonValue,
  intentTypeLabels,
  leadTypeLabels,
  priorityClasses,
  priorityLabels,
  receiverTypeLabels,
} from "@/components/doctor/doctor-panel-utils"
import { safeJsonParse } from "@/lib/json-utils"

export type UserActionEventView = {
  id: string
  eventType: string
  eventName: string
  pagePath: string
  content?: string | null
  occurredAt: string
}

export type IntentInsightView = {
  id: string
  intentType: string
  title: string
  summary: string
  confidence: number
  evidenceEventsJson: string
  suggestedAction: string
  priority: string
  status: string
}

export type ServiceLeadView = {
  id: string
  leadType: string
  receiverType: string
  title: string
  summary: string
  suggestedAction: string
  priority: string
  status: string
}

export function IntentAnalysisPanel({
  events,
  insights,
  leads,
}: {
  events: UserActionEventView[]
  insights: IntentInsightView[]
  leads: ServiceLeadView[]
}) {
  const [leadStatuses, setLeadStatuses] = useState<Record<string, string>>(
    Object.fromEntries(leads.map((lead) => [lead.id, lead.status]))
  )
  const [message, setMessage] = useState("")

  async function updateLead(leadId: string, status: string, feedbackType: string) {
    setLeadStatuses((current) => ({ ...current, [leadId]: status }))
    setMessage("")

    const response = await fetch(`/api/doctor/service-leads/${leadId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        feedbackType,
        comment: `医生端操作：${feedbackType}`,
        operatorName: "医生端演示账号",
      }),
    })

    setMessage(response.ok ? "线索状态已更新" : "状态更新失败，已保留页面临时状态")
  }

  if (insights.length === 0 && events.length === 0) {
    return (
      <Card className="rounded-lg border-slate-200 bg-white">
        <CardContent className="py-8 text-sm text-slate-500">暂无行为意图数据。</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id} className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>{intentTypeLabels[insight.intentType] ?? insight.title}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${priorityClasses[insight.priority] ?? priorityClasses.LOW}`}>
                {priorityLabels[insight.priority] ?? insight.priority}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="leading-6 text-slate-700">{insight.summary}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock title="置信度" value={`${Math.round(insight.confidence * 100)}%`} />
              <InfoBlock title="系统建议" value={insight.suggestedAction} />
            </div>
            <InfoBlock
              title="触发证据"
              value={formatJsonValue(safeJsonParse<unknown>(insight.evidenceEventsJson, []))}
            />
          </CardContent>
        </Card>
      ))}

      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">用户行为事件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="grid gap-2 rounded-md bg-slate-50 p-3 text-sm md:grid-cols-[150px_1fr_120px]">
              <span className="font-medium text-slate-900">{event.eventName}</span>
              <span className="text-slate-600">{event.content ?? event.pagePath}</span>
              <span className="text-xs text-slate-500">{new Date(event.occurredAt).toLocaleDateString("zh-CN")}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">相关服务线索</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-950">{lead.title}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                  {leadStatuses[lead.id] ?? lead.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lead.summary}</p>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <InfoBlock title="线索类型" value={leadTypeLabels[lead.leadType] ?? lead.leadType} />
                <InfoBlock title="分派对象" value={receiverTypeLabels[lead.receiverType] ?? lead.receiverType} />
                <InfoBlock title="建议动作" value={lead.suggestedAction} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, "VIEWED", "标记已查看")}>标记已查看</Button>
                <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, "CONTACTED", "标记已联系")}>标记已联系</Button>
                <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, "IGNORED", "与本次就诊无关")}>与本次就诊无关</Button>
                <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, "VIEWED", "信息不准确")}>信息不准确</Button>
              </div>
            </article>
          ))}
          {message ? (
            <p className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" />
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3 ring-1 ring-slate-100">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value || "暂无"}</p>
    </div>
  )
}
