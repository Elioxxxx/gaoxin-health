import Link from "next/link"
import { Star, Stethoscope } from "lucide-react"
import { notFound } from "next/navigation"

import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"

export default async function DoctorDetailPage({
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

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-sky-700 p-5 text-white">
        <p className="text-sm text-sky-100">医生详情</p>
        <h1 className="mt-2 text-2xl font-semibold">{doctor.name}</h1>
        <p className="mt-2 text-sm leading-6 text-sky-50">
          {doctor.title} · {doctor.department.name}
        </p>
      </section>

      <Card className="rounded-lg border-sky-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="size-4 text-sky-600" />
            执业信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <InfoRow label="所属机构" value={doctor.institution.name} />
          <InfoRow label="所属科室" value={doctor.department.name} />
          <InfoRow label="职称" value={doctor.title} />
          <div className="flex flex-wrap gap-1.5">
            {doctor.isExpert ? (
              <HealthTagBadge tone="amber">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3" />
                  专家池
                </span>
              </HealthTagBadge>
            ) : (
              <HealthTagBadge tone="sky">医生资源</HealthTagBadge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-sky-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">擅长方向</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {parseJsonArray(doctor.specialties).map((item) => (
              <HealthTagBadge key={item} tone="sky">
                {item}
              </HealthTagBadge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-sky-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">简介</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">{doctor.introduction}</p>
        </CardContent>
      </Card>

      <Link href="/app/pre-consult" className={buttonVariants({ className: "w-full" })}>
        发起预问诊
      </Link>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right text-slate-900">{value}</span>
    </div>
  )
}
