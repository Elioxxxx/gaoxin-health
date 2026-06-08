"use client"

import Link from "next/link"
import { CalendarCheck, CheckCircle2, ChevronRight, Hospital } from "lucide-react"
import { useState } from "react"

import {
  getRecommendationDisplayTag,
  getRecommendationReasonTags,
} from "@/lib/gaoxin/display-mappers"
import { trackUserAction } from "@/lib/intent/client-action"
import { parseJsonArray } from "@/lib/json"

type GaoxinRecommendationCardProps = {
  recommendation: {
    id: string
    rank: number
    reasons: string
    institution: { name: string; type?: string }
    department: { name: string }
    doctor?: { name: string; title: string; isExpert: boolean } | null
  }
  guidePlanId?: string | null
  recommendationPath: string
}

export function GaoxinRecommendationCard({
  recommendation,
  guidePlanId,
  recommendationPath,
}: GaoxinRecommendationCardProps) {
  const [saved, setSaved] = useState(false)
  const guideTarget = guidePlanId ?? recommendation.id
  const appointmentHref = `/gaoxin/resources?from=ai&institution=${encodeURIComponent(
    recommendation.institution.name
  )}&department=${encodeURIComponent(recommendation.department.name)}`
  const displayTag = getRecommendationDisplayTag(recommendation)
  const reasonTags = getRecommendationReasonTags(recommendation)

  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Hospital className="size-4" />
            </span>
            <p className="text-xs font-semibold text-emerald-700">
              推荐路径：{recommendationPath}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              推荐 {recommendation.rank}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              {displayTag}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
            {recommendation.institution.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {recommendation.department.name}
            {recommendation.doctor
              ? ` · ${recommendation.doctor.name} ${recommendation.doctor.title}`
              : " · 暂不指定医生"}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Hospital className="size-5" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {reasonTags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1 rounded-2xl bg-slate-50 p-3">
        {parseJsonArray(recommendation.reasons)
          .slice(0, 4)
          .map((reason) => (
            <p key={reason} className="text-xs leading-5 text-slate-600">
              · {reason}
            </p>
          ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link
          href={`/gaoxin/guide/${guideTarget}`}
          onClick={() =>
            trackUserAction({
              eventType: "GUIDE_GENERATED",
              eventName: "查看导诊指引",
              content: `${recommendation.institution.name} ${recommendation.department.name}`,
              targetType: "guide_plan",
              targetId: guideTarget,
            })
          }
          className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-emerald-600 text-xs font-semibold text-white"
        >
          查看导诊
          <ChevronRight className="size-3.5" />
        </Link>
        <Link
          href={appointmentHref}
          onClick={() =>
            trackUserAction({
              eventType: "APPOINTMENT_CLICK",
              eventName: "点击去预约挂号",
              content: `${recommendation.institution.name} ${recommendation.department.name}`,
              targetType: "institution",
              targetId: recommendation.id,
            })
          }
          className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-slate-50 text-xs font-semibold text-slate-600 ring-1 ring-slate-100"
        >
          <CalendarCheck className="size-3.5" />
          去预约挂号
        </Link>
        <button
          type="button"
          onClick={() => {
            setSaved(true)
            trackUserAction({
              eventType: "PAGE_VIEW",
              eventName: "保存导诊记录",
              content: `${recommendation.institution.name} ${recommendation.department.name}`,
              targetType: "recommendation",
              targetId: recommendation.id,
            })
          }}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-slate-50 text-xs font-semibold text-slate-600 ring-1 ring-slate-100"
        >
          <CheckCircle2 className="size-3.5" />
          {saved ? "已保存" : "保存记录"}
        </button>
      </div>
    </section>
  )
}
