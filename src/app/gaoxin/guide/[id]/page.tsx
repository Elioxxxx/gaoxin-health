import Link from "next/link"
import { FileHeart, ListTodo, MapPin, Navigation, Stethoscope } from "lucide-react"
import { notFound } from "next/navigation"

import { GaoxinGuideCard } from "@/components/gaoxin/gaoxin-guide-card"
import { prisma } from "@/lib/db/prisma"
import {
  getRecommendationDisplayTag,
  getRecommendationReasonTags,
  sanitizeResidentRecommendationReasons,
} from "@/lib/gaoxin/display-mappers"
import { getGaoxinRecommendationPath } from "@/lib/gaoxin/recommendation-path"
import { parseJsonArray } from "@/lib/json"

export default async function GaoxinGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guide =
    (await findGuideById(id)) ??
    (await prisma.guidePlan.findFirst({
      where: {
        OR: [{ sessionId: id }, { recommendationId: id }],
      },
      include: guideInclude,
    }))

  if (!guide || !guide.recommendation) {
    notFound()
  }

  const recommendation = guide.recommendation
  const path = getGaoxinRecommendationPath({
    institutionName: recommendation.institution.name,
    doctorIsExpert: recommendation.doctor?.isExpert,
    triageLevel: guide.session.triageResult?.level,
  })
  const steps = parseJsonArray(guide.steps)
  const preparationItems = parseJsonArray(guide.preparationItems)
  const recommendationReasons = sanitizeResidentRecommendationReasons(
    parseJsonArray(recommendation.reasons)
  )
  const displayTag = getRecommendationDisplayTag(recommendation)
  const reasonTags = getRecommendationReasonTags(recommendation)
  const appointmentHref = `/gaoxin/resources?from=guide&institution=${encodeURIComponent(
    recommendation.institution.name
  )}&department=${encodeURIComponent(recommendation.department.name)}`

  return (
    <div className="space-y-3">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#0f766e,#10b981)] p-5 text-white shadow-sm">
        <p className="text-sm text-emerald-50">导诊指引</p>
        <h1 className="mt-2 text-2xl font-semibold">{guide.title}</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          按推荐机构、科室和就医步骤完成准备。
        </p>
      </section>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex items-center gap-2">
          <Stethoscope className="size-4 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-950">推荐就诊信息</h2>
        </div>
        <div className="space-y-3 text-sm">
          <InfoRow label="推荐机构" value={recommendation.institution.name} />
          <InfoRow label="推荐科室" value={recommendation.department.name} />
          <InfoRow
            label="推荐医生"
            value={
              recommendation.doctor
                ? `${recommendation.doctor.name} ${recommendation.doctor.title}`
                : "暂不指定医生"
            }
          />
          <InfoRow label="推荐路径" value={path} />
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-semibold text-slate-950">推荐理由</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[displayTag, ...reasonTags].map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 space-y-1 rounded-2xl bg-slate-50 p-3">
          {recommendationReasons.slice(0, 4).map((reason) => (
            <p key={reason} className="text-xs leading-5 text-slate-600">
              · {reason}
            </p>
          ))}
        </div>
      </section>

      <GaoxinGuideCard steps={steps.length > 0 ? steps : defaultGuideSteps} />

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-semibold text-slate-950">检查准备事项</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(preparationItems.length > 0 ? preparationItems : defaultPreparationItems).map((item) => (
            <span key={item} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex items-center gap-2">
          <Navigation className="size-4 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-950">到院导航说明</h2>
        </div>
        <p className="text-sm leading-6 text-slate-600">{guide.navigationText}</p>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-1 size-4 shrink-0 text-emerald-600" />
            {recommendation.institution.address}
          </div>
          <div className="mt-3 flex h-24 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dcfce7,#e0f2fe)] text-sm font-medium text-emerald-700">
            地图导航占位
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 ring-1 ring-emerald-100">
        本次导诊已同步至医生端，医生可在健康高新医生工作台查看预问诊报告、健康档案摘要和推荐理由。
      </section>

      <section className="grid grid-cols-3 gap-2 pb-2">
        <Link href={appointmentHref} className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          去预约挂号
        </Link>
        <Link href="/gaoxin/health-record" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <FileHeart className="size-3.5" />
          健康档案
        </Link>
        <Link href="/gaoxin/health-management" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <ListTodo className="size-3.5" />
          健康任务
        </Link>
      </section>
      <section className="pb-2">
        <Link href="/gaoxin/ai" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          返回 AI健康
        </Link>
      </section>
    </div>
  )
}

const guideInclude = {
  recommendation: {
    include: {
      institution: true,
      department: true,
      doctor: true,
    },
  },
  session: {
    include: {
      triageResult: true,
    },
  },
} as const

function findGuideById(id: string) {
  return prisma.guidePlan.findUnique({
    where: { id },
    include: guideInclude,
  })
}

const defaultGuideSteps = [
  "携带身份证、电子健康卡、既往检查资料和用药清单",
  "按推荐科室挂号",
  "到院后先完成分诊/签到",
  "就诊后根据医生建议检查或复诊",
  "后续可在健康管理中查看随访任务",
]

const defaultPreparationItems = [
  "身份证",
  "电子健康卡",
  "既往检查资料",
  "用药清单",
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-sm leading-5 text-slate-700">{value}</span>
    </div>
  )
}
