import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "indigo",
}: {
  title: string
  value: string | number
  icon: LucideIcon
  tone?: "indigo" | "emerald" | "rose" | "amber" | "sky" | "slate"
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
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
