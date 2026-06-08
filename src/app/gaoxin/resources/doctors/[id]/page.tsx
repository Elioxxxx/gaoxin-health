import Link from "next/link"
import type { ReactNode } from "react"
import { BadgeCheck, Stethoscope, UserRound } from "lucide-react"
import { notFound } from "next/navigation"

import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import { GaoxinTrackedLink } from "@/components/gaoxin/gaoxin-tracked-link"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"

export default async function GaoxinDoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })

  if (!doctor) {
    notFound()
  }

  const specialties = parseJsonArray(doctor.specialties)

  return (
    <div className="space-y-3">
      <GaoxinActionTracker
        eventType="DOCTOR_VIEW"
        eventName="浏览医生详情"
        content={`${doctor.name} ${doctor.department.name}`}
        targetType="doctor"
        targetId={doctor.id}
        metadata={{ institution: doctor.institution.name, isExpert: doctor.isExpert }}
      />
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#0f766e,#38bdf8)] p-5 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-[24px] bg-white/20">
            <UserRound className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{doctor.name}</h1>
            <p className="mt-2 text-sm text-emerald-50">{doctor.title}</p>
            {doctor.isExpert ? (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                <BadgeCheck className="size-3.5" />
                专家池医生
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <Card title="执业信息">
        <InfoRow label="所属机构" value={doctor.institution.name} />
        <InfoRow label="所属科室" value={doctor.department.name} />
        <InfoRow label="专家池" value={doctor.isExpert ? "是" : "否"} />
      </Card>

      <Card title="擅长方向">
        <div className="flex flex-wrap gap-1.5">
          {specialties.map((item) => (
            <span key={item} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {item}
            </span>
          ))}
        </div>
      </Card>

      <Card title="医生简介">
        <p className="text-sm leading-6 text-slate-600">{doctor.introduction}</p>
      </Card>

      <section className="grid grid-cols-2 gap-2 pb-2">
        <GaoxinTrackedLink
          href="/gaoxin/pre-consult"
          eventType="AI_CHAT"
          eventName="医生详情页发起导诊"
          content={`${doctor.name} ${doctor.department.name}`}
          targetType="doctor"
          targetId={doctor.id}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-emerald-600 text-sm font-semibold text-white"
        >
          <Stethoscope className="size-4" />
          找 TA 导诊
        </GaoxinTrackedLink>
        <Link href="/gaoxin/resources" className="inline-flex h-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
          返回资源列表
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
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-sm leading-5 text-slate-700">{value}</span>
    </div>
  )
}
