import Link from "next/link"
import { ClipboardList, FileText, MessageSquareCheck, ShieldAlert } from "lucide-react"

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
import { getDoctorReportSessions } from "@/server/queries/doctor-query"

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

export default async function DoctorReportsPage() {
  const sessions = await getDoctorReportSessions()
  const reportCount = sessions.filter((item) => item.report).length
  const highRiskCount = sessions.filter((item) =>
    ["P0", "P1"].includes(item.triageResult?.level ?? "")
  ).length
  const profileCount = sessions.filter((item) => item.resident.doctorProfiles.length > 0).length
  const feedbackCount = sessions.filter((item) => item.feedback.length > 0).length

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-slate-950">患者报告</h2>
        <p className="mt-2 text-sm text-slate-500">
          汇总居民智能预问诊报告、医生版健康档案状态、推荐科室和医生反馈情况。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="报告总数" value={reportCount} icon={FileText} tone="sky" />
        <StatCard title="需优先关注" value={highRiskCount} icon={ShieldAlert} tone="rose" />
        <StatCard title="医生版档案" value={profileCount} icon={ClipboardList} tone="amber" />
        <StatCard title="已有反馈" value={feedbackCount} icon={MessageSquareCheck} tone="emerald" />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">预问诊报告列表</h3>
          <p className="mt-1 text-sm text-slate-500">点击查看详情可进入患者完整医生端档案。</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="min-w-36">患者</TableHead>
                <TableHead className="min-w-56">主诉与报告摘要</TableHead>
                <TableHead>分诊</TableHead>
                <TableHead className="min-w-44">推荐去向</TableHead>
                <TableHead className="min-w-44">档案与反馈</TableHead>
                <TableHead className="min-w-32">更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const recommendation = session.recommendations[0]
                const patient = session.resident

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium text-slate-950">{patient.name}</div>
                      <div className="text-xs text-slate-500">
                        {patient.age}岁 / {patient.gender}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-80 whitespace-normal">
                      <div className="font-medium text-slate-900">
                        {session.report?.chiefComplaint ?? session.initialInput}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {session.report?.doctorSummary ?? "暂无医生版预问诊摘要"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DoctorTriageBadge level={session.triageResult?.level} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {session.triageResult?.suggestedDepartment ??
                          recommendation?.department.name ??
                          "待评估"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {recommendation?.institution.name ?? "暂无推荐机构"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                          {patient.doctorProfiles.length > 0 ? "已生成医生版档案" : "待生成档案"}
                        </Badge>
                        <Badge variant={session.feedback.length > 0 ? "secondary" : "outline"}>
                          {session.feedback.length > 0 ? "已有反馈" : "待反馈"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {dateFormatter.format(session.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/doctor/patients/${patient.id}`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        查看详情
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">暂无患者报告。</div>
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
  icon: typeof FileText
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
