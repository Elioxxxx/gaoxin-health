import Link from "next/link"
import { Star } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { parseJsonArray } from "@/lib/json"

type DoctorCardProps = {
  doctor: {
    id: string
    name: string
    title: string
    specialties: string
    isExpert: boolean
    introduction: string
    institution?: { name: string } | null
    department?: { name: string } | null
  }
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="rounded-lg border-sky-100 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{doctor.name}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {doctor.title} · {doctor.department?.name ?? "科室待配置"}
            </p>
          </div>
          {doctor.isExpert ? (
            <HealthTagBadge tone="amber">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3" />
                专家池
              </span>
            </HealthTagBadge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs leading-5 text-slate-600">
          {doctor.institution?.name}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {parseJsonArray(doctor.specialties)
            .slice(0, 4)
            .map((tag) => (
              <HealthTagBadge key={tag} tone="sky">
                {tag}
              </HealthTagBadge>
            ))}
        </div>
        <Link
          href={`/app/resources/doctors/${doctor.id}`}
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          查看医生
        </Link>
      </CardContent>
    </Card>
  )
}
