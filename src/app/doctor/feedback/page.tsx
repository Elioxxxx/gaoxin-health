import Link from "next/link"
import { AlertCircle, MessageSquareCheck, Star, ThumbsUp } from "lucide-react"

import { DoctorTriageBadge } from "@/components/doctor/doctor-badges"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDoctorFeedbackRecords } from "@/server/queries/doctor-query"

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

export default async function DoctorFeedbackPage() {
  const feedback = await getDoctorFeedbackRecords()
  const positiveCount = feedback.filter((item) => item.rating >= 4).length
  const issueCount = feedback.reduce((sum, item) => sum + item.issues.length, 0)
  const doctorSourceCount = feedback.filter((item) => item.source.includes("doctor")).length

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-slate-950">反馈记录</h2>
        <p className="mt-2 text-sm text-slate-500">
          汇总医生对智能预问诊、分诊推荐和健康档案摘要的评价，供质控复盘使用。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="反馈总数" value={feedback.length} icon={MessageSquareCheck} tone="sky" />
        <StatCard title="正向反馈" value={positiveCount} icon={ThumbsUp} tone="emerald" />
        <StatCard title="关联问题" value={issueCount} icon={AlertCircle} tone="rose" />
        <StatCard title="医生提交" value={doctorSourceCount} icon={Star} tone="amber" />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">医生反馈明细</h3>
          <p className="mt-1 text-sm text-slate-500">可从患者详情页继续查看对应报告和推荐理由。</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="min-w-36">患者</TableHead>
                <TableHead className="min-w-52">关联报告</TableHead>
                <TableHead>分诊</TableHead>
                <TableHead className="min-w-32">评分</TableHead>
                <TableHead className="min-w-64">反馈内容</TableHead>
                <TableHead className="min-w-36">质量问题</TableHead>
                <TableHead className="min-w-32">提交时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((item) => {
                const session = item.session
                const patient = session?.resident
                const recommendation = session?.recommendations[0]

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-slate-950">{patient?.name ?? "未知患者"}</div>
                      <div className="text-xs text-slate-500">
                        {patient ? `${patient.age}岁 / ${patient.gender}` : "未关联居民档案"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-64 whitespace-normal">
                      <div className="font-medium text-slate-900">
                        {session?.report?.chiefComplaint ?? session?.initialInput ?? "未关联报告"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {recommendation?.institution.name ?? "暂无推荐机构"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DoctorTriageBadge level={session?.triageResult?.level} />
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">
                        {item.rating} / 5
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-80 whitespace-normal text-sm leading-5 text-slate-600">
                      {item.comment}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.issues.length > 0 ? (
                          item.issues.slice(0, 2).map((issue) => (
                            <Badge key={issue.id} variant="outline" className="text-xs">
                              {issue.status}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">无关联问题</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {dateFormatter.format(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {patient ? (
                        <Link
                          href={`/doctor/patients/${patient.id}`}
                          className={buttonVariants({ size: "sm", variant: "outline" })}
                        >
                          查看患者
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">不可查看</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">暂无医生反馈记录。</div>
        ) : null}
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: number
  icon: typeof MessageSquareCheck
  tone: "sky" | "rose" | "amber" | "emerald"
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
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
