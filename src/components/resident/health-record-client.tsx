"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Pill, ShieldCheck, UserRound } from "lucide-react"

import { HealthSummaryCard } from "@/components/resident/health-summary-card"
import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { Timeline } from "@/components/resident/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ResidentRecord = {
  id: string
  name: string
  gender: string
  age: number
  phone: string
  address: string
  community: string
  familyDoctorName?: string | null
  healthTags: Array<{ id: string; name: string; color?: string | null }>
  healthSummaries: Array<{ id: string; title: string; summaryText: string; summaryJson: string }>
  medicalRecords: Array<{
    id: string
    institutionName: string
    departmentName: string
    visitDate: string
    chiefComplaint: string
    diagnosisText: string
    treatmentText: string
  }>
  diagnoses: Array<{ id: string; name: string; status: string; notes?: string | null }>
  medications: Array<{ id: string; name: string; dosage: string; frequency: string; notes?: string | null }>
  allergies: Array<{ id: string; allergen: string; reaction: string; severity: string }>
  labResults: Array<{
    id: string
    itemName: string
    value: string
    unit?: string | null
    abnormalFlag?: string | null
    resultDate: string
  }>
}

export function HealthRecordClient({ residents }: { residents: ResidentRecord[] }) {
  const [residentId, setResidentId] = useState(residents[0]?.id ?? "")
  const resident = useMemo(
    () => residents.find((item) => item.id === residentId) ?? residents[0],
    [residentId, residents]
  )

  if (!resident) {
    return <p className="text-sm text-slate-500">暂无居民档案。</p>
  }

  const latestSummary = resident.healthSummaries[0]
  const abnormalLabs = resident.labResults.filter(
    (item) => item.abnormalFlag && item.abnormalFlag !== "正常"
  )

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-emerald-700 p-5 text-white">
        <p className="text-sm text-emerald-100">我的健康档案</p>
        <h1 className="mt-2 text-2xl font-semibold">跨机构健康摘要</h1>
        <select
          value={residentId}
          onChange={(event) => setResidentId(event.target.value)}
          className="mt-4 h-10 w-full rounded-lg border-0 bg-white px-3 text-sm text-slate-900"
        >
          {residents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4 text-emerald-600" />
            居民基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-600">
          <InfoRow label="姓名" value={`${resident.name} · ${resident.gender} · ${resident.age}岁`} />
          <InfoRow label="电话" value={resident.phone} />
          <InfoRow label="社区" value={resident.community} />
          <InfoRow label="家庭医生" value={resident.familyDoctorName ?? "未签约"} />
          <InfoRow label="地址" value={resident.address} />
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">健康标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {resident.healthTags.map((tag) => (
              <HealthTagBadge
                key={tag.id}
                tone={tag.color === "red" ? "rose" : "emerald"}
              >
                {tag.name}
              </HealthTagBadge>
            ))}
          </div>
        </CardContent>
      </Card>

      <HealthSummaryCard summary={latestSummary?.summaryText ?? "暂无摘要。"} />

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-emerald-600" />
            既往诊断
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {resident.diagnoses.map((item) => (
            <InfoRow key={item.id} label={item.name} value={item.status} />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="size-4 text-emerald-600" />
            用药摘要
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {resident.medications.map((item) => (
            <InfoRow
              key={item.id}
              label={item.name}
              value={`${item.dosage} · ${item.frequency}`}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="size-4 text-rose-600" />
            过敏史与检验异常
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="mb-2 font-medium text-slate-900">过敏史</p>
            <div className="flex flex-wrap gap-1.5">
              {resident.allergies.map((item) => (
                <HealthTagBadge key={item.id} tone="rose">
                  {item.allergen} · {item.reaction}
                </HealthTagBadge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium text-slate-900">检查检验重点异常</p>
            <div className="space-y-2">
              {abnormalLabs.length > 0 ? (
                abnormalLabs.map((item) => (
                  <InfoRow
                    key={item.id}
                    label={item.itemName}
                    value={`${item.value}${item.unit ?? ""} · ${item.abnormalFlag}`}
                  />
                ))
              ) : (
                <p className="text-slate-500">暂无重点异常。</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">跨机构就诊时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline
            items={resident.medicalRecords.map((record) => ({
              title: `${record.institutionName} · ${record.departmentName}`,
              description: `${record.chiefComplaint}；${record.diagnosisText}；${record.treatmentText}`,
              date: new Date(record.visitDate).toLocaleDateString("zh-CN"),
            }))}
          />
        </CardContent>
      </Card>

      <details className="rounded-lg bg-white p-4 ring-1 ring-emerald-100">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          医生版摘要
        </summary>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
          {latestSummary?.summaryText ?? "暂无医生版摘要。"}
        </p>
      </details>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right text-slate-900">{value}</span>
    </div>
  )
}
