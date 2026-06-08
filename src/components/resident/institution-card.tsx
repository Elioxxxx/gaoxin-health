import Link from "next/link"
import { MapPin } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { parseJsonArray } from "@/lib/json"

type InstitutionCardProps = {
  institution: {
    id: string
    name: string
    type: string
    level: string
    address: string
    capabilities: string
  }
}

export function InstitutionCard({ institution }: InstitutionCardProps) {
  const tags = parseJsonArray(institution.capabilities).slice(0, 4)

  return (
    <Card className="rounded-lg border-emerald-100 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{institution.name}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {institution.type === "TERTIARY_HOSPITAL"
                ? "综合性三甲医院"
                : "社区卫生服务中心"}{" "}
              · {institution.level}
            </p>
          </div>
          <HealthTagBadge tone={institution.type === "TERTIARY_HOSPITAL" ? "sky" : "emerald"}>
            {institution.type === "TERTIARY_HOSPITAL" ? "三甲" : "社区"}
          </HealthTagBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex gap-1.5 text-xs leading-5 text-slate-600">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
          {institution.address}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <HealthTagBadge key={tag} tone="slate">
              {tag}
            </HealthTagBadge>
          ))}
        </div>
        <Link
          href={`/app/resources/institutions/${institution.id}`}
          className={buttonVariants({ className: "w-full" })}
        >
          查看详情
        </Link>
      </CardContent>
    </Card>
  )
}
