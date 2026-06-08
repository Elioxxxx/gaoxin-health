import { AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatJsonValue,
  priorityClasses,
  priorityLabels,
  riskCategoryLabels,
  type RiskFocusItemView,
} from "@/components/doctor/doctor-panel-utils"
import { safeJsonParse } from "@/lib/json-utils"

const categoryOrder = [
  "ACUTE_RISK",
  "CHRONIC_CONTROL",
  "MEDICATION_SAFETY",
  "SPECIAL_POPULATION",
  "LAB_TREND",
  "MAJOR_HISTORY",
  "LIFESTYLE_RISK",
  "CARE_BEHAVIOR",
  "PUBLIC_HEALTH_FOLLOWUP",
  "DATA_QUALITY",
]

const priorityOrder: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

export function RiskFocusPanel({ items }: { items: RiskFocusItemView[] }) {
  if (items.length === 0) {
    return (
      <Card className="rounded-lg border-slate-200 bg-white">
        <CardContent className="py-8 text-sm text-slate-500">暂无风险关注点。</CardContent>
      </Card>
    )
  }

  const grouped = items.reduce<Record<string, RiskFocusItemView[]>>((acc, item) => {
    return { ...acc, [item.category]: [...(acc[item.category] ?? []), item] }
  }, {})
  const orderedGroups = Object.entries(grouped).sort(
    ([categoryA], [categoryB]) =>
      categoryIndex(categoryA) - categoryIndex(categoryB) || categoryA.localeCompare(categoryB)
  )

  return (
    <div className="space-y-4">
      {orderedGroups.map(([category, categoryItems]) => (
        <Card key={category} className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-orange-600" />
              {riskCategoryLabels[category] ?? category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...categoryItems].sort(compareRiskItems).map((item) => {
              const evidence = safeJsonParse<Record<string, unknown>>(item.evidenceJson, {})

              return (
                <article key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-950">{item.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${priorityClasses[item.priority] ?? priorityClasses.LOW}`}>
                      {priorityLabels[item.priority] ?? item.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
                  <div className="mt-3 rounded-md bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">证据</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{formatJsonValue(evidence) || "暂无"}</p>
                  </div>
                  <div className="mt-3 rounded-md bg-sky-50 p-3">
                    <p className="text-xs font-semibold text-sky-700">建议医生操作</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.suggestedDoctorAction}</p>
                  </div>
                </article>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function categoryIndex(category: string) {
  const index = categoryOrder.indexOf(category)
  return index === -1 ? categoryOrder.length : index
}

function compareRiskItems(a: RiskFocusItemView, b: RiskFocusItemView) {
  return (
    (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9) ||
    a.title.localeCompare(b.title, "zh-CN")
  )
}
