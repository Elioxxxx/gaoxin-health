import Link from "next/link"
import { FileText, Home, MapPin } from "lucide-react"
import { notFound } from "next/navigation"

import { GuideStepList } from "@/components/resident/guide-step-list"
import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"

export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guide = await prisma.guidePlan.findUnique({
    where: { id },
    include: {
      recommendation: {
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      },
      session: {
        include: {
          report: true,
        },
      },
    },
  })

  if (!guide || !guide.recommendation) {
    notFound()
  }

  const recommendation = guide.recommendation
  const preparationItems = parseJsonArray(guide.preparationItems)

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-emerald-700 p-5 text-white">
        <p className="text-sm text-emerald-100">导诊详情</p>
        <h1 className="mt-2 text-2xl font-semibold">{guide.title}</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          按推荐机构、科室和医生完成就医准备。
        </p>
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">推荐就诊信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <InfoRow label="机构" value={recommendation.institution.name} />
          <InfoRow label="科室" value={recommendation.department.name} />
          <InfoRow
            label="医生"
            value={
              recommendation.doctor
                ? `${recommendation.doctor.name} ${recommendation.doctor.title}`
                : "暂不指定医生"
            }
          />
          <div className="flex flex-wrap gap-1.5">
            <HealthTagBadge tone="emerald">推荐分 {recommendation.score}</HealthTagBadge>
            {recommendation.doctor?.isExpert ? (
              <HealthTagBadge tone="amber">专家池医生</HealthTagBadge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">个性化导诊步骤</h2>
        <GuideStepList steps={parseJsonArray(guide.steps)} />
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">检查准备事项</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {preparationItems.map((item) => (
              <HealthTagBadge key={item} tone="slate">
                {item}
              </HealthTagBadge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">到院导航说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-1 size-4 shrink-0 text-emerald-600" />
            {guide.navigationText}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            就医前需携带材料：身份证或医保凭证、既往检查资料、当前用药清单、过敏史记录。
          </p>
        </CardContent>
      </Card>

      <Button type="button" className="w-full" variant="outline">
        <FileText className="size-4" />
        分享预问诊报告给医生
      </Button>
      <Link href="/app" className={buttonVariants({ className: "w-full" })}>
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
