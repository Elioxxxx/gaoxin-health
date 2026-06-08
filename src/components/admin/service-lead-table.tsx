"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type AdminServiceLead = {
  id: string
  receiverType: string
  leadType: string
  title: string
  summary: string
  suggestedAction: string
  priority: string
  status: string
  resident: { name: string; age?: number; gender?: string; community?: string }
  intentInsight?: { intentType: string; summary: string } | null
  receiverInstitution?: { name: string } | null
  receiverDepartment?: { name: string } | null
}

const receiverLabels: Record<string, string> = {
  HOSPITAL: "医院",
  COMMUNITY_HEALTH_CENTER: "社区卫生服务中心",
  HEALTH_COMMISSION: "卫健端",
}

const leadLabels: Record<string, string> = {
  SPECIALTY_VISIT: "专科就诊",
  CHRONIC_FOLLOWUP: "慢病随访",
  REPORT_REVIEW: "报告复核",
  FAMILY_DOCTOR: "家庭医生",
  CHILD_CARE: "儿童保健",
  MATERNAL_CARE: "孕产妇服务",
  ELDERLY_CARE: "老年健康",
  MEDICATION_SAFETY: "用药安全",
  PUBLIC_HEALTH: "公共卫生",
  HEALTH_EDUCATION: "健康教育",
}

const priorityLabels: Record<string, string> = {
  URGENT: "紧急",
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
}

const statusLabels: Record<string, string> = {
  PENDING: "待处理",
  VIEWED: "已查看",
  CONTACTED: "已联系",
  FOLLOWUP_ADDED: "已纳入随访",
  TRANSFERRED: "已转派",
  CLOSED: "已关闭",
  IGNORED: "已忽略",
}

export function ServiceLeadTable({
  leads,
  title = "线索明细表",
  defaultReceiverType = "all",
}: {
  leads: AdminServiceLead[]
  title?: string
  defaultReceiverType?: string
}) {
  const [items, setItems] = useState(leads)
  const [receiverType, setReceiverType] = useState(defaultReceiverType)
  const [leadType, setLeadType] = useState("all")
  const [priority, setPriority] = useState("all")
  const [status, setStatus] = useState("all")
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (receiverType === "all" || item.receiverType === receiverType) &&
          (leadType === "all" || item.leadType === leadType) &&
          (priority === "all" || item.priority === priority) &&
          (status === "all" || item.status === status)
      ),
    [items, leadType, priority, receiverType, status]
  )

  async function updateStatus(id: string, nextStatus: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
    await fetch(`/api/admin/service-leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => undefined)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">支持按接收对象、线索类型、优先级和状态筛选。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={receiverType} onChange={setReceiverType} options={["all", "HOSPITAL", "COMMUNITY_HEALTH_CENTER", "HEALTH_COMMISSION"]} labels={{ all: "全部对象", ...receiverLabels }} />
            <Select value={leadType} onChange={setLeadType} options={["all", ...Object.keys(leadLabels)]} labels={{ all: "全部类型", ...leadLabels }} />
            <Select value={priority} onChange={setPriority} options={["all", "URGENT", "HIGH", "MEDIUM", "LOW"]} labels={{ all: "全部优先级", ...priorityLabels }} />
            <Select value={status} onChange={setStatus} options={["all", ...Object.keys(statusLabels)]} labels={{ all: "全部状态", ...statusLabels }} />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>患者</TableHead>
              <TableHead>意图/类型</TableHead>
              <TableHead>接收方</TableHead>
              <TableHead>优先级</TableHead>
              <TableHead>触发原因</TableHead>
              <TableHead>系统建议</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="min-w-56">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium text-slate-950">{item.resident.name}</div>
                  <div className="text-xs text-slate-500">{item.resident.community ?? "高新区"}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{leadLabels[item.leadType] ?? item.leadType}</div>
                  <div className="text-xs text-slate-500">{item.intentInsight?.intentType ?? "行为规则识别"}</div>
                </TableCell>
                <TableCell className="max-w-48 whitespace-normal text-sm text-slate-600">
                  {item.receiverInstitution?.name ?? receiverLabels[item.receiverType] ?? item.receiverType}
                </TableCell>
                <TableCell>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}>
                    {priorityLabels[item.priority] ?? item.priority}
                  </span>
                </TableCell>
                <TableCell className="max-w-72 whitespace-normal text-xs leading-5 text-slate-600">
                  {item.summary}
                </TableCell>
                <TableCell className="max-w-80 whitespace-normal text-xs leading-5 text-slate-600">
                  {item.suggestedAction}
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "VIEWED")}>已查看</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "CONTACTED")}>已联系</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "FOLLOWUP_ADDED")}>纳入随访</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "CLOSED")}>关闭</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function Select({
  value,
  onChange,
  options,
  labels,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  labels: Record<string, string>
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
    >
      {options.map((item) => (
        <option key={item} value={item}>{labels[item] ?? item}</option>
      ))}
    </select>
  )
}

function priorityClass(priority: string) {
  if (priority === "URGENT") return "bg-red-50 text-red-700"
  if (priority === "HIGH") return "bg-orange-50 text-orange-700"
  if (priority === "MEDIUM") return "bg-blue-50 text-blue-700"
  return "bg-slate-100 text-slate-600"
}
