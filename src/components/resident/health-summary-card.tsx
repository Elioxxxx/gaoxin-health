import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HealthSummaryCard({
  title = "健康档案摘要",
  summary,
}: {
  title?: string
  summary: string
}) {
  return (
    <Card className="rounded-lg border-emerald-100 bg-white">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{summary}</p>
      </CardContent>
    </Card>
  )
}
