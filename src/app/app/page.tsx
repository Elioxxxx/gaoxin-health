import Link from "next/link"
import {
  Activity,
  Baby,
  Building2,
  CalendarClock,
  ChevronRight,
  FileText,
  HeartPulse,
  Hospital,
  Stethoscope,
  Syringe,
  UserRoundSearch,
} from "lucide-react"

import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"

const quickEntries = [
  { href: "/app/pre-consult", label: "智能预问诊", icon: FileText, tone: "bg-emerald-100 text-emerald-700" },
  { href: "/app/health-record", label: "我的健康档案", icon: HeartPulse, tone: "bg-sky-100 text-sky-700" },
  { href: "/app/resources", label: "找医院", icon: Hospital, tone: "bg-indigo-100 text-indigo-700" },
  { href: "/app/resources", label: "找医生", icon: UserRoundSearch, tone: "bg-amber-100 text-amber-700" },
  { href: "/app/resources?type=community", label: "社区卫生服务中心", icon: Building2, tone: "bg-teal-100 text-teal-700" },
  { href: "/app/health-management", label: "健康管理", icon: CalendarClock, tone: "bg-rose-100 text-rose-700" },
]

const popularScience = [
  { title: "胸痛及时就医", icon: Activity, tag: "急症识别" },
  { title: "高血压慢病管理", icon: HeartPulse, tag: "慢病随访" },
  { title: "儿童发热观察", icon: Baby, tag: "儿童健康" },
  { title: "体检血糖偏高怎么办", icon: Syringe, tag: "健康管理" },
]

export default async function ResidentHomePage() {
  const [
    tertiaryCount,
    communityCount,
    expertCount,
    latestSession,
    latestSummary,
  ] = await Promise.all([
    prisma.institution.count({ where: { type: "TERTIARY_HOSPITAL" } }),
    prisma.institution.count({ where: { type: "COMMUNITY_HEALTH_CENTER" } }),
    prisma.doctor.count({ where: { isExpert: true } }),
    prisma.preConsultSession.findFirst({
      orderBy: { updatedAt: "desc" },
      include: {
        triageResult: true,
        recommendations: {
          orderBy: { rank: "asc" },
          take: 1,
          include: { institution: true, department: true },
        },
      },
    }),
    prisma.healthSummary.findFirst({
      orderBy: { updatedAt: "desc" },
      include: { resident: true },
    }),
  ])

  const latestRecommendation = latestSession?.recommendations[0]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg bg-emerald-700 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-100">官方居民健康服务入口</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              健康高新
            </h1>
            <p className="mt-2 text-sm leading-6 text-emerald-50">
              成都高新区居民健康服务入口
            </p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-lg bg-white/15">
            <Stethoscope className="size-7" />
          </div>
        </div>
        <Link
          href="/app/pre-consult"
          className={buttonVariants({
            className: "mt-5 w-full bg-white text-emerald-700 hover:bg-emerald-50",
          })}
        >
          发起智能预问诊
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {quickEntries.map((entry) => {
          const Icon = entry.icon

          return (
            <Link
              key={entry.label}
              href={entry.href}
              className="rounded-lg bg-white p-3 text-center shadow-sm ring-1 ring-emerald-100"
            >
              <div className={`mx-auto flex size-10 items-center justify-center rounded-lg ${entry.tone}`}>
                <Icon className="size-5" />
              </div>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-700">
                {entry.label}
              </p>
            </Link>
          )
        })}
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">高新区医疗资源</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["三甲医院", tertiaryCount],
              ["社区中心", communityCount],
              ["专家池医生", expertCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-semibold text-emerald-700">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">最近记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <RecordRow
            label="最近一次预问诊"
            value={
              latestSession
                ? `${latestSession.scenarioKey} · ${latestSession.triageResult?.level ?? "待分诊"}`
                : "暂无记录"
            }
          />
          <RecordRow
            label="最近一次推荐"
            value={
              latestRecommendation
                ? `${latestRecommendation.institution.name} · ${latestRecommendation.department.name}`
                : "暂无推荐"
            }
          />
          <RecordRow
            label="最近一次健康档案更新"
            value={
              latestSummary
                ? `${latestSummary.resident.name} · ${latestSummary.title}`
                : "暂无更新"
            }
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">健康科普</h2>
          <HealthTagBadge tone="emerald">Mock 知识库</HealthTagBadge>
        </div>
        <div className="grid gap-3">
          {popularScience.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-emerald-100"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.tag}</p>
                </div>
                <ChevronRight className="size-4 text-slate-300" />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right text-slate-900">{value}</span>
    </div>
  )
}
