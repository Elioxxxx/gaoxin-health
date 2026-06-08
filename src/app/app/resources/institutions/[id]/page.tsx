import Link from "next/link"
import { MapPin } from "lucide-react"
import { notFound } from "next/navigation"

import { DoctorCard } from "@/components/resident/doctor-card"
import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const institution = await prisma.institution.findUnique({
    where: { id },
    include: {
      departments: { include: { doctors: true } },
      doctors: {
        include: {
          institution: true,
          department: true,
        },
      },
      serviceCapabilities: true,
    },
  })

  if (!institution) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-emerald-700 p-5 text-white">
        <p className="text-sm text-emerald-100">
          {institution.type === "TERTIARY_HOSPITAL" ? "综合性三甲医院" : "社区卫生服务中心"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{institution.name}</h1>
        <p className="mt-2 flex gap-2 text-sm leading-6 text-emerald-50">
          <MapPin className="mt-1 size-4 shrink-0" />
          {institution.address}
        </p>
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">机构简介</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-slate-600">{institution.description}</p>
          <div className="flex flex-wrap gap-1.5">
            <HealthTagBadge tone="emerald">{institution.level}</HealthTagBadge>
            {parseJsonArray(institution.capabilities).map((item) => (
              <HealthTagBadge key={item} tone="slate">
                {item}
              </HealthTagBadge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">科室列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {institution.departments.map((department) => (
            <div key={department.id} className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-900">{department.name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {department.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">医生列表</h2>
        {institution.doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">推荐场景说明</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            {institution.type === "TERTIARY_HOSPITAL"
              ? "适用于 P0/P1 高风险、专科诊疗、复杂检查和专家门诊推荐。"
              : "适用于 P3/P4 慢病复诊、家庭医生签约、健康管理和康复随访。"}
          </p>
        </CardContent>
      </Card>

      <Link href="/app/pre-consult" className={buttonVariants({ className: "w-full" })}>
        发起预问诊
      </Link>
    </div>
  )
}
