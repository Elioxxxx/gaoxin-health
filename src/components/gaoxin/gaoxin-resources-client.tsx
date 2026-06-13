"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Bot, ChevronRight, Search } from "lucide-react"

import type { GaoxinDoctorItem, GaoxinInstitutionItem } from "@/lib/resource"
import { trackUserAction } from "@/lib/intent/client-action"
import { cn } from "@/lib/utils"

const filters = [
  { key: "all", label: "全部" },
  { key: "TERTIARY_HOSPITAL", label: "三甲医院" },
  { key: "COMMUNITY_HEALTH_CENTER", label: "社区卫生服务中心" },
  { key: "expert", label: "专家池" },
]

export function GaoxinResourcesClient({
  institutions,
  doctors,
  initialKeyword = "",
  sourceHint,
}: {
  institutions: GaoxinInstitutionItem[]
  doctors: GaoxinDoctorItem[]
  initialKeyword?: string
  sourceHint?: string
}) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [filter, setFilter] = useState("all")
  const visible = useMemo(() => {
    const text = keyword.trim()
    const expertInstitutions = new Set(
      doctors.filter((doctor) => doctor.isExpert).map((doctor) => doctor.institutionName)
    )

    return institutions.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        item.type === filter ||
        (filter === "expert" && expertInstitutions.has(item.name))
      const relatedDoctors = doctors.filter((doctor) => doctor.institutionName === item.name)
      const haystack = [
        item.name,
        item.typeLabel,
        item.address,
        ...item.capabilities,
        ...relatedDoctors.map((doctor) => `${doctor.name}${doctor.departmentName}${doctor.specialties.join("")}`),
      ].join("")

      return matchesFilter && (!text || haystack.includes(text))
    })
  }, [doctors, filter, institutions, keyword])

  return (
    <div className="space-y-3">
      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-lg font-semibold text-slate-950">医疗资源</h1>
        {sourceHint ? (
          <p className="mt-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-700">
            {sourceHint}
          </p>
        ) : null}
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <Search className="size-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索医院、社区卫生服务中心、科室、医生"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
                filter === item.key
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-white text-slate-600 ring-slate-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-[linear-gradient(135deg,#ecfdf5,#eff6ff)] p-4 shadow-sm ring-1 ring-white">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Bot className="size-5" />
          </div>
          <p className="text-sm leading-6 text-slate-600">
            小高健康助手可根据您的症状、健康档案和就医偏好推荐合适机构。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        {visible.map((item) => (
          <Link
            key={item.id}
            href={`/gaoxin/resources/institutions/${item.id}`}
            onClick={() =>
              trackUserAction({
                eventType: "RESOURCE_VIEW",
                eventName: "查看机构详情",
                content: item.name,
                targetType: "institution",
                targetId: item.id,
                metadata: { type: item.type, capabilities: item.capabilities },
              })
            }
            className="block rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold leading-6 text-slate-950">{item.name}</h2>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {item.typeLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{item.level}</p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.address}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.capabilities.map((capability) => (
                <span key={capability} className="rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-600">
                  {capability}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {visible.length === 0 ? (
          <div className="rounded-[26px] bg-white p-5 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
            暂无匹配医疗资源。
          </div>
        ) : null}
      </section>
    </div>
  )
}
