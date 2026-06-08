import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type LabResultView = {
  id: string
  itemName: string
  value: string
  unit?: string | null
  abnormalFlag?: string | null
  resultDate?: string
  referenceRange?: string | null
}

export function LabTrendPanel({ labs }: { labs: LabResultView[] }) {
  const abnormalLabs = labs.filter((item) => item.abnormalFlag && item.abnormalFlag !== "正常")
  const grouped = labs.reduce<Record<string, LabResultView[]>>((acc, item) => ({
    ...acc,
    [item.itemName]: [...(acc[item.itemName] ?? []), item],
  }), {})

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {abnormalLabs.slice(0, 4).map((item) => (
          <Card key={item.id} className="rounded-lg border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">{item.itemName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2">
                <p className="text-xl font-semibold text-slate-950">
                  {item.value}
                  <span className="ml-1 text-sm text-slate-500">{item.unit}</span>
                </p>
                {item.abnormalFlag?.includes("低") || item.abnormalFlag?.includes("阴性") ? (
                  <TrendingDown className="size-5 text-sky-600" />
                ) : (
                  <TrendingUp className="size-5 text-orange-600" />
                )}
              </div>
              <p className="mt-2 text-xs text-orange-700">{item.abnormalFlag}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">检查检验趋势明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>指标</TableHead>
                <TableHead>最近结果</TableHead>
                <TableHead>历史记录</TableHead>
                <TableHead>医生关注点</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(grouped).map(([name, items]) => {
                const sorted = [...items].sort(
                  (a, b) => new Date(b.resultDate ?? 0).getTime() - new Date(a.resultDate ?? 0).getTime()
                )
                const latest = sorted[0]

                return (
                  <TableRow key={name}>
                    <TableCell className="font-medium text-slate-900">{name}</TableCell>
                    <TableCell>
                      {latest.value}
                      {latest.unit ?? ""} · {latest.abnormalFlag ?? "未标记"}
                    </TableCell>
                    <TableCell className="max-w-80 whitespace-normal text-xs leading-5 text-slate-600">
                      {sorted.map((item) => `${formatDate(item.resultDate)} ${item.value}${item.unit ?? ""}`).join("；")}
                    </TableCell>
                    <TableCell className="max-w-72 whitespace-normal text-xs leading-5 text-slate-600">
                      {latest.referenceRange ?? (latest.abnormalFlag && latest.abnormalFlag !== "正常" ? "建议结合病史复核异常指标。" : "常规随访。")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(value: string | undefined) {
  return value ? new Date(value).toLocaleDateString("zh-CN") : "未记录"
}
