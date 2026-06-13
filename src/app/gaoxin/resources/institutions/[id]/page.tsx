import Link from "next/link"
import type { ReactNode } from "react"
import { Building2, CalendarCheck, ChevronRight, Stethoscope } from "lucide-react"
import { notFound } from "next/navigation"

import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { GaoxinTrackedLink } from "@/components/gaoxin/gaoxin-tracked-link"
import { parseJsonArray } from "@/lib/json"
import { getInstitutionDetails } from "@/server/queries/resource-query"

export default async function GaoxinInstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const institution = await getInstitutionDetails(id)

  if (!institution) {
    notFound()
  }

  const capabilities = parseJsonArray(institution.capabilities)

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="RESOURCE_VIEW"
        eventName="浏览机构详情"
        content={institution.name}
        targetType="institution"
        targetId={institution.id}
      />
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#0f766e,#10b981)] p-5 text-white shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Building2 className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-7">{institution.name}</h1>
            <p className="mt-2 text-sm text-emerald-50">
              {institution.type === "TERTIARY_HOSPITAL" ? "三甲医院" : "社区卫生服务中心"} · {institution.level}
            </p>
          </div>
        </div>
      </section>

      <Card title="机构信息">
        <InfoRow label="地址" value={institution.address} />
        <p className="text-sm leading-6 text-slate-600">{institution.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {capabilities.map((item) => (
            <span key={item} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {item}
            </span>
          ))}
        </div>
      </Card>

      <Card title="科室列表">
        <div className="grid grid-cols-2 gap-2">
          {institution.departments.map((department) => (
            <div key={department.id} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{department.name}</p>
              <p className="mt-1 text-xs text-slate-400">{department.doctors.length} 名医生</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="医生列表">
        <div className="space-y-2">
          {institution.doctors.slice(0, 8).map((doctor) => (
            <GaoxinTrackedLink
              key={doctor.id}
              href={`/gaoxin/resources/doctors/${doctor.id}`}
              eventType="DOCTOR_VIEW"
              eventName="从机构页查看医生"
              content={`${doctor.name} ${doctor.department.name}`}
              targetType="doctor"
              targetId={doctor.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{doctor.name} {doctor.title}</p>
                <p className="mt-1 text-xs text-slate-500">{doctor.department.name}</p>
              </div>
              <ChevronRight className="size-4 text-slate-300" />
            </GaoxinTrackedLink>
          ))}
        </div>
      </Card>

      <Card title="适合场景">
        <div className="grid grid-cols-2 gap-2">
          {["急危重症", "专科门诊", "慢病复诊", "康复随访"].map((item) => (
            <div key={item} className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {item}
            </div>
          ))}
        </div>
      </Card>

      <section className="grid grid-cols-3 gap-2 pb-2">
        <GaoxinTrackedLink
          href="/gaoxin/pre-consult"
          eventType="AI_CHAT"
          eventName="机构页发起智能导诊"
          content={institution.name}
          targetType="institution"
          targetId={institution.id}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-emerald-600 text-xs font-semibold text-white"
        >
          <Stethoscope className="size-3.5" />
          智能导诊
        </GaoxinTrackedLink>
        <button type="button" className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <CalendarCheck className="size-3.5" />
          预约挂号
        </button>
        <Link href="/gaoxin/resources" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          返回列表
        </Link>
      </section>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-3 text-base font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-sm leading-5 text-slate-700">{value}</span>
    </div>
  )
}
