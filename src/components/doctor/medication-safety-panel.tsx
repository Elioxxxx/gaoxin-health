import { ShieldAlert } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type MedicationView = {
  id: string
  name: string
  dosage: string
  frequency: string
  notes?: string | null
  startDate?: string | null
  endDate?: string | null
}

export type AllergyView = {
  id: string
  allergen: string
  reaction: string
  severity: string
  notes?: string | null
}

export function MedicationSafetyPanel({
  medications,
  allergies,
}: {
  medications: MedicationView[]
  allergies: AllergyView[]
}) {
  const longTerm = medications.filter((item) => !item.endDate && !item.name.includes("暂未"))
  const temporary = medications.filter((item) => item.endDate || item.name.includes("抗生素") || item.name.includes("暂未"))

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <MedicationList title="当前/长期用药" items={longTerm.length > 0 ? longTerm : medications} />
      <MedicationList title="临时用药或曾咨询用药" items={temporary} emptyText="暂无临时用药记录。" />

      <Card className="rounded-lg border-slate-200 bg-white xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-4 text-orange-600" />
            过敏史、禁忌与慎用提示
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {allergies.length > 0 ? (
            allergies.map((item) => (
              <div key={item.id} className="rounded-lg bg-orange-50 p-3 text-sm">
                <p className="font-semibold text-orange-900">{item.allergen}</p>
                <p className="mt-1 text-orange-800">反应：{item.reaction}</p>
                <p className="mt-1 text-orange-800">严重程度：{item.severity}</p>
                <p className="mt-1 leading-6 text-slate-700">{item.notes ?? "建议面诊时核实。"}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">暂无明确过敏记录，仍需面诊核实。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MedicationList({
  title,
  items,
  emptyText = "暂无用药记录。",
}: {
  title: string
  items: MedicationView[]
  emptyText?: string
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-950">{item.name}</p>
              <p className="mt-1 text-slate-700">
                {item.dosage} · {item.frequency}
              </p>
              <p className="mt-1 leading-6 text-slate-600">{item.notes ?? "暂无备注"}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  )
}
