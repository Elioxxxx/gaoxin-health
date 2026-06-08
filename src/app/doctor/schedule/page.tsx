import Link from "next/link"
import { CalendarDays } from "lucide-react"

import { DoctorTriageBadge } from "@/components/doctor/doctor-badges"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/db/prisma"

const statuses = ["待到诊", "已到诊", "已完成", "已转诊"]

export default async function DoctorSchedulePage() {
  const sessions = await prisma.preConsultSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      resident: true,
      triageResult: true,
      recommendations: {
        orderBy: { rank: "asc" },
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">今日接诊</h2>
            <p className="text-sm text-slate-500">
              第一版复用智能导诊推荐患者，展示接诊状态。
            </p>
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">今日患者列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>患者</TableHead>
                <TableHead>分诊</TableHead>
                <TableHead>推荐机构</TableHead>
                <TableHead>医生</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session, index) => {
                const recommendation = session.recommendations[0]

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium text-slate-950">
                        {session.resident.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {session.resident.age}岁 / {session.resident.gender}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DoctorTriageBadge level={session.triageResult?.level} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {recommendation?.institution.name ?? "暂无"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {recommendation?.department.name ?? "暂无科室"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {recommendation?.doctor
                        ? `${recommendation.doctor.name} ${recommendation.doctor.title}`
                        : "暂不指定医生"}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {statuses[index % statuses.length]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/doctor/patients/${session.resident.id}`}
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
        </CardContent>
      </Card>
    </div>
  )
}
