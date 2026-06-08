import Link from "next/link"
import { AlertTriangle, Home } from "lucide-react"
import { notFound } from "next/navigation"

import { RecommendationCard } from "@/components/resident/recommendation-card"
import { TriageLevelBadge } from "@/components/resident/triage-level-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"
import { cn } from "@/lib/utils"

export default async function PreConsultResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await prisma.preConsultSession.findUnique({
    where: { id },
    include: {
      resident: {
        include: {
          healthSummaries: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      report: true,
      triageResult: true,
      recommendations: {
        orderBy: { rank: "asc" },
        include: { institution: true, department: true, doctor: true },
      },
      guidePlans: true,
    },
  })

  if (!session || !session.report || !session.triageResult) {
    notFound()
  }

  const triageResult = session.triageResult
  const highRisk =
    triageResult.level === "P0" || triageResult.level === "P1"
  const communityCare = triageResult.level === "P3"
  const guideByRecommendation = new Map(
    session.guidePlans.map((guide) => [guide.recommendationId, guide.id])
  )

  return (
    <div className="space-y-4">
      <section
        className={cn(
          "rounded-lg p-5 text-white",
          highRisk ? "bg-rose-600" : communityCare ? "bg-emerald-700" : "bg-sky-700"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm opacity-90">预问诊结果</p>
            <h1 className="mt-2 text-2xl font-semibold">
              {highRisk ? "请优先就医" : communityCare ? "建议社区承接" : "建议按需就医"}
            </h1>
            <p className="mt-2 text-sm leading-6 opacity-90">
              {session.triageResult.suggestedCareType}
            </p>
          </div>
          <TriageLevelBadge level={triageResult.level} />
        </div>
        {highRisk ? (
          <div className="mt-4 flex gap-2 rounded-lg bg-white/15 p-3 text-sm leading-6">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            P0/P1 为高风险提示，请结合实际情况优先前往急诊或胸痛中心。
          </div>
        ) : null}
      </section>

      <div className="rounded-lg bg-white p-3 ring-1 ring-emerald-100">
        <div className="grid grid-cols-5 gap-1 text-center text-[11px] font-medium text-emerald-700">
          {["预问诊完成", "健康档案生成", "分诊完成", "推荐完成", "导诊生成"].map((item) => (
            <div key={item} className="rounded-md bg-emerald-50 px-1 py-2">
              {item}
            </div>
          ))}
        </div>
      </div>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">分诊建议</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <InfoRow label="风险等级" value={triageResult.level} />
          <InfoRow label="建议方式" value={triageResult.suggestedCareType} />
          <InfoRow label="推荐科室" value={triageResult.suggestedDepartment} />
          <InfoRow
            label="判断依据"
            value={parseJsonArray(triageResult.reasons).join("；")}
          />
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">居民版解释</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            {session.report.patientExplanation}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">预问诊摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
          <p>主诉：{session.report.chiefComplaint}</p>
          <p>现病史：{session.report.presentIllness}</p>
          <p>医生摘要：{session.report.doctorSummary}</p>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">健康档案摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            {session.resident.healthSummaries[0]?.summaryText ?? "暂无健康档案摘要。"}
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">推荐机构/科室/医生</h2>
        {session.recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            guidePlanId={guideByRecommendation.get(recommendation.id)}
            triageLevel={triageResult.level}
          />
        ))}
      </section>

      <Link href="/app" className={buttonVariants({ variant: "outline", className: "w-full" })}>
        <Home className="size-4" />
        返回首页
      </Link>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right text-slate-900">{value}</span>
    </div>
  )
}
