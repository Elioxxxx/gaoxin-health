"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, AlertTriangle, Building2, FileHeart, Hospital, Percent, UsersRound } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { AdminPageHeader } from "@/components/admin/admin-section"
import { StatCard } from "@/components/admin/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardData = {
  cards: {
    todayPreConsultCount: number
    healthSummaryCount: number
    tertiaryRecommendationCount: number
    communityRecommendationCount: number
    agentRunCount: number
    agentErrorCount: number
    qualityIssueCount: number
    feedbackCount: number
    feedbackAccuracyRate: number
  }
  triageDistribution: Array<{ level: string; count: number }>
  institutionFlow: Array<{ name: string; value: number }>
  hotSymptoms: Array<{ name: string; value: number }>
  hotDepartments: Array<{ name: string; value: number }>
}

const colors = ["#dc2626", "#e11d48", "#f97316", "#059669", "#0284c7"]

export function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((response) => response.json())
      .then((payload: { data: DashboardData }) => setData(payload.data))
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="运行驾驶舱" description="正在加载区域运行数据..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="运行驾驶舱"
        description="汇总预问诊、健康档案、推荐流向、医生反馈和 Agent 运行质量。"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="今日预问诊人数" value={data.cards.todayPreConsultCount} icon={UsersRound} tone="indigo" />
        <StatCard title="今日生成健康档案数" value={data.cards.healthSummaryCount} icon={FileHeart} tone="emerald" />
        <StatCard title="推荐到三甲医院人数" value={data.cards.tertiaryRecommendationCount} icon={Hospital} tone="sky" />
        <StatCard title="推荐到社区中心人数" value={data.cards.communityRecommendationCount} icon={Building2} tone="emerald" />
        <StatCard title="医生反馈准确率" value={`${data.cards.feedbackAccuracyRate}%`} icon={Percent} tone="indigo" />
        <StatCard title="医生反馈数" value={data.cards.feedbackCount} icon={UsersRound} tone="sky" />
        <StatCard title="Agent 调用总数" value={data.cards.agentRunCount} icon={Activity} tone="slate" />
        <StatCard title="Agent 错误数" value={data.cards.agentErrorCount} icon={AlertTriangle} tone="rose" />
        <StatCard title="QualityIssue 数量" value={data.cards.qualityIssueCount} icon={AlertTriangle} tone="amber" />
      </section>

      <Card className="rounded-lg border-indigo-100 bg-[linear-gradient(135deg,#eef2ff,#ecfdf5)]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">居民意图与服务线索</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              基于居民行为识别医院、社区、卫健可承接的服务机会，支持区域健康需求洞察与服务线索分派。
            </p>
          </div>
          <Link
            href="/admin/intent-insights"
            className="inline-flex h-10 items-center rounded-md bg-indigo-700 px-4 text-sm font-semibold text-white"
          >
            查看意图洞察
          </Link>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="P0-P4 分布">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.triageDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="level" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.triageDistribution.map((entry, index) => (
                  <Cell key={entry.level} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="三甲/社区推荐占比">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.institutionFlow} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} label>
                {data.institutionFlow.map((entry, index) => (
                  <Cell key={entry.name} fill={index === 0 ? "#0284c7" : "#059669"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="热门症状排行">
          <RankList data={data.hotSymptoms} />
        </ChartCard>

        <ChartCard title="热门推荐科室">
          <RankList data={data.hotDepartments} />
        </ChartCard>
      </section>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function RankList({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="space-y-3">
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-xs font-semibold text-indigo-700">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate font-medium text-slate-900">{item.name}</span>
                <span className="text-slate-500">{item.value}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{ width: `${Math.min(100, item.value * 20)}%` }}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">暂无数据</p>
      )}
    </div>
  )
}
