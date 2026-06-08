import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthTagBadge } from "@/components/resident/health-tag-badge"
import { parseJsonArray } from "@/lib/json"

type RecommendationCardProps = {
  recommendation: {
    id: string
    rank: number
    score: number
    reasons: string
    institution: { name: string }
    department: { name: string }
    doctor?: { name: string; title: string; isExpert: boolean } | null
  }
  guidePlanId?: string
  triageLevel?: string
}

export function RecommendationCard({
  recommendation,
  guidePlanId,
  triageLevel,
}: RecommendationCardProps) {
  const path = getRecommendationPath(recommendation, triageLevel)

  return (
    <Card className="rounded-lg border-emerald-100 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              #{recommendation.rank} {recommendation.institution.name}
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {recommendation.department.name} ·{" "}
              {recommendation.doctor
                ? `${recommendation.doctor.name} ${recommendation.doctor.title}`
                : "暂不指定医生"}
            </p>
          </div>
          <HealthTagBadge tone="emerald">{recommendation.score}分</HealthTagBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <HealthTagBadge tone={path === "三甲专家" ? "amber" : path === "社区卫生服务中心" ? "emerald" : "sky"}>
            推荐路径：{path}
          </HealthTagBadge>
          <HealthTagBadge tone="slate">匹配分：{recommendation.score}</HealthTagBadge>
        </div>
        <ul className="space-y-1 text-xs leading-5 text-slate-600">
          {parseJsonArray(recommendation.reasons).map((reason) => (
            <li key={reason}>· {reason}</li>
          ))}
        </ul>
        {guidePlanId ? (
          <Link
            href={`/app/guide/${guidePlanId}`}
            className={buttonVariants({ className: "w-full" })}
          >
            下一步：查看导诊
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

function getRecommendationPath(
  recommendation: RecommendationCardProps["recommendation"],
  triageLevel?: string
) {
  if (recommendation.doctor?.isExpert || triageLevel === "P0" || triageLevel === "P1") {
    return "三甲专家"
  }

  if (recommendation.institution.name.includes("社区卫生服务中心")) {
    return "社区卫生服务中心"
  }

  if (triageLevel === "P4") {
    return "健康管理"
  }

  return "普通门诊"
}
