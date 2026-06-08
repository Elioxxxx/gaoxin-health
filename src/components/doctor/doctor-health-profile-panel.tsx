import { FileText, ListChecks } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type DoctorHealthProfileView,
  parseJsonList,
} from "@/components/doctor/doctor-panel-utils"

export function DoctorHealthProfilePanel({
  profile,
}: {
  profile?: DoctorHealthProfileView | null
}) {
  if (!profile) {
    return (
      <Card className="rounded-lg border-slate-200 bg-white">
        <CardContent className="py-8 text-sm text-slate-500">
          暂无医生版健康档案，请先生成健康档案摘要。
        </CardContent>
      </Card>
    )
  }

  const majorProblems = parseJsonList(profile.majorProblemsJson)
  const currentVisit = parseJsonList(profile.currentVisitRelevanceJson)
  const checklist = parseJsonList(profile.doctorChecklistJson)
  const sources = parseJsonList(profile.sourceRecordsJson)

  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-sky-700" />
            {profile.summaryTitle}
          </CardTitle>
          <p className="text-xs text-slate-500">
            生成时间：{new Date(profile.generatedAt).toLocaleString("zh-CN")}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-700">{profile.onePageSummary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard title="主要健康问题" items={majorProblems} />
        <ListCard title="本次就诊相关重点" items={currentVisit} />
      </div>

      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="size-4 text-emerald-700" />
            医生核实清单
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {checklist.map((item) => (
            <label key={item} className="flex items-start gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <input type="checkbox" className="mt-1" readOnly />
              <span>{item}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <ListCard title="数据来源" items={sources} />
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">暂无结构化数据。</p>
        )}
      </CardContent>
    </Card>
  )
}
