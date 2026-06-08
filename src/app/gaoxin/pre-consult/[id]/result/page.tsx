import Link from "next/link"
import type { ReactNode } from "react"
import { ClipboardList, FileHeart, RefreshCcw } from "lucide-react"
import { notFound } from "next/navigation"

import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { GaoxinRecommendationCard } from "@/components/gaoxin/gaoxin-recommendation-card"
import { GaoxinTrackedLink } from "@/components/gaoxin/gaoxin-tracked-link"
import { prisma } from "@/lib/db/prisma"
import {
  getResidentCareAdvice,
  getResidentCareToneClass,
  sanitizeResidentAttentionItems,
  sanitizeResidentRecommendationReasons,
} from "@/lib/gaoxin/display-mappers"
import { getGaoxinRecommendationPath } from "@/lib/gaoxin/recommendation-path"
import { parseJsonArray } from "@/lib/json"
import { cn } from "@/lib/utils"

export default async function GaoxinPreConsultResultPage({
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
          healthTags: true,
          healthSummaries: { orderBy: { createdAt: "desc" }, take: 1 },
          diagnoses: true,
          medications: true,
          labResults: true,
          allergies: true,
          medicalRecords: { orderBy: { visitDate: "desc" }, take: 5 },
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

  const triage = session.triageResult
  const report = session.report
  const careAdvice = getResidentCareAdvice(triage.level)
  const careTone = getResidentCareToneClass(careAdvice.tone)
  const guideByRecommendation = new Map(
    session.guidePlans.map((guide) => [guide.recommendationId, guide.id])
  )
  const primaryRecommendation = session.recommendations[0]
  const primaryGuideId = primaryRecommendation
    ? guideByRecommendation.get(primaryRecommendation.id)
    : undefined
  const primaryPath = primaryRecommendation
    ? getGaoxinRecommendationPath({
        institutionName: primaryRecommendation.institution.name,
        doctorIsExpert: primaryRecommendation.doctor?.isExpert,
        triageLevel: triage.level,
      })
    : "导诊推荐"
  const riskFlags = sanitizeResidentAttentionItems(parseJsonArray(report.riskFlags))
  const referencedInfo = [
    {
      title: "您的本次描述",
      desc: session.initialInput || report.chiefComplaint,
    },
    {
      title: "健康档案摘要",
      desc: session.resident.healthSummaries[0]?.summaryText ?? "已参考健康高新整理的健康档案摘要。",
    },
    {
      title: "既往就诊记录",
      desc:
        session.resident.medicalRecords
          .slice(0, 2)
          .map((item) => `${item.institutionName}${item.departmentName ? ` · ${item.departmentName}` : ""}`)
          .join("；") || "暂无明确既往就诊记录。",
    },
    {
      title: "检查检验记录",
      desc:
        session.resident.labResults
          .slice(0, 3)
          .map((item) => `${item.itemName} ${item.value}${item.unit ?? ""}`)
          .join("；") || "暂无重点检查检验记录。",
    },
    {
      title: "社区随访记录",
      desc:
        session.resident.medicalRecords
          .filter((item) => `${item.sourceType}${item.institutionName}`.includes("community") || item.institutionName.includes("社区"))
          .slice(0, 2)
          .map((item) => `${item.institutionName} · ${item.diagnosisText}`)
          .join("；") || "暂无社区随访记录。",
    },
  ]

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="GUIDE_GENERATED"
        eventName="查看智能预问诊结果"
        content={report.chiefComplaint}
        targetType="pre_consult_session"
        targetId={session.id}
      />
      <section className="rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-medium text-emerald-700">
          {["预问诊完成", "健康档案生成", "建议生成", "推荐完成", "导诊生成"].map((item) => (
            <div key={item} className="rounded-xl bg-emerald-50 px-1 py-2">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={cn("rounded-[28px] p-5 text-white shadow-sm", careTone.hero)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm opacity-90">本次就医建议</p>
            <h1 className="mt-2 text-2xl font-semibold leading-9">{careAdvice.title}</h1>
            <p className="mt-3 text-sm leading-6 opacity-95">{careAdvice.description}</p>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            小高健康助手
          </span>
        </div>
        <div className="mt-4 rounded-2xl bg-white/15 p-3 text-sm leading-6">
          <p>建议科室：{triage.suggestedDepartment}</p>
          <p className="mt-1">推荐路径：{primaryPath}</p>
          <GaoxinTrackedLink
            href={
              primaryGuideId
                ? `/gaoxin/guide/${primaryGuideId}`
                : primaryRecommendation
                  ? `/gaoxin/guide/${primaryRecommendation.id}`
                  : "/gaoxin/resources"
            }
            eventType="GUIDE_GENERATED"
            eventName="结果页查看导诊"
            content={report.chiefComplaint}
            targetType="guide_plan"
            targetId={primaryGuideId ?? primaryRecommendation?.id}
            className="mt-3 inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-slate-900"
          >
            {careAdvice.actionText}
          </GaoxinTrackedLink>
        </div>
      </section>

      <InfoCard title="预问诊摘要" icon={<ClipboardList className="size-4 text-emerald-600" />}>
        <InfoRow label="主诉" value={report.chiefComplaint} />
        <InfoRow label="持续时间" value={extractDuration(report.presentIllness, session.initialInput)} />
        <InfoRow label="既往史" value={report.pastHistory} />
        <InfoRow label="用药史" value={report.medicationHistory} />
        <InfoRow label="过敏史" value={report.allergyHistory} />
        <div>
          <p className="text-xs text-slate-400">需关注信息</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {riskFlags.map((item) => (
              <span key={item} className={cn("rounded-full px-2 py-1 text-xs font-medium", careTone.badge)}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </InfoCard>

      <InfoCard title="健康档案摘要" icon={<FileHeart className="size-4 text-emerald-600" />}>
        <div>
          <p className="text-xs text-slate-400">健康标签</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {session.resident.healthTags.map((tag) => (
              <span key={tag.id} className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                {sanitizeResidentAttentionItems([tag.name])[0]}
              </span>
            ))}
          </div>
        </div>
        <InfoRow label="既往诊断" value={session.resident.diagnoses.map((item) => item.name).join("、") || "暂无"} />
        <InfoRow label="用药摘要" value={session.resident.medications.map((item) => item.name).join("、") || "暂无"} />
        <InfoRow
          label="检查检验关注点"
          value={
            session.resident.labResults
              .filter((item) => item.abnormalFlag && item.abnormalFlag !== "正常")
              .map((item) => `${item.itemName} ${item.value}`)
              .join("、") || "暂无重点异常"
          }
        />
        <GaoxinTrackedLink
          href="/gaoxin/health-record"
          eventType="HEALTH_RECORD_VIEW"
          eventName="结果页查看健康档案"
          content={session.resident.name}
          className="text-sm font-semibold text-emerald-700"
        >
          查看健康档案摘要
        </GaoxinTrackedLink>
      </InfoCard>

      <InfoCard title="本次建议参考了哪些信息" icon={<FileHeart className="size-4 text-emerald-600" />}>
        <p className="rounded-2xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
          小高健康助手会结合您的本次描述和已整理的健康档案，生成就医建议。
        </p>
        <div className="space-y-2">
          {referencedInfo.map((item) => (
            <div key={item.title} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <section className="space-y-3">
        <h2 className="px-1 text-base font-semibold text-slate-950">推荐机构/科室/医生</h2>
        {session.recommendations.map((recommendation) => {
          const recommendationPath = getGaoxinRecommendationPath({
            institutionName: recommendation.institution.name,
            doctorIsExpert: recommendation.doctor?.isExpert,
            triageLevel: triage.level,
          })
          const residentReasons = sanitizeResidentRecommendationReasons(
            parseJsonArray(recommendation.reasons)
          )

          return (
            <GaoxinRecommendationCard
              key={recommendation.id}
              recommendation={{
                id: recommendation.id,
                rank: recommendation.rank,
                reasons: JSON.stringify(residentReasons),
                institution: {
                  name: recommendation.institution.name,
                  type: recommendation.institution.type,
                },
                department: {
                  name: recommendation.department.name,
                },
                doctor: recommendation.doctor
                  ? {
                      name: recommendation.doctor.name,
                      title: recommendation.doctor.title,
                      isExpert: recommendation.doctor.isExpert,
                    }
                  : null,
              }}
              guidePlanId={guideByRecommendation.get(recommendation.id)}
              recommendationPath={recommendationPath}
            />
          )
        })}
      </section>

      <section className="grid grid-cols-3 gap-2 pb-2">
        <Link href="/gaoxin/ai" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          返回 AI健康
        </Link>
        <Link href="/gaoxin/pre-consult" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          <RefreshCcw className="size-3.5" />
          重新咨询
        </Link>
        <GaoxinTrackedLink
          href="/gaoxin/health-record"
          eventType="HEALTH_RECORD_VIEW"
          eventName="结果页底部查看健康档案"
          content={session.resident.name}
          className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white"
        >
          健康档案
        </GaoxinTrackedLink>
      </section>
    </div>
  )
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="space-y-3 text-sm">{children}</div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-sm leading-5 text-slate-700">{value}</span>
    </div>
  )
}

function extractDuration(presentIllness: string, initialInput: string) {
  const text = `${presentIllness} ${initialInput}`
  return text.match(/[一二三四五六七八九十0-9]+(个)?(小时|天|周|月)/)?.[0] ?? "详见现病史描述"
}
