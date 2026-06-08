"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { InstitutionCard } from "@/components/resident/institution-card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InstitutionResource = {
  id: string
  name: string
  type: string
  level: string
  address: string
  capabilities: string
}

const filters = [
  { label: "全部", value: "all" },
  { label: "三甲医院", value: "TERTIARY_HOSPITAL" },
  { label: "社区卫生服务中心", value: "COMMUNITY_HEALTH_CENTER" },
]

export function ResourcesClient({
  institutions,
  initialFilter = "all",
}: {
  institutions: InstitutionResource[]
  initialFilter?: string
}) {
  const [keyword, setKeyword] = useState("")
  const [filter, setFilter] = useState(initialFilter)
  const visible = useMemo(
    () =>
      institutions.filter((institution) => {
        const matchesFilter = filter === "all" || institution.type === filter
        const matchesKeyword =
          keyword.trim().length === 0 ||
          `${institution.name} ${institution.address} ${institution.level}`.includes(keyword.trim())

        return matchesFilter && matchesKeyword
      }),
    [filter, institutions, keyword]
  )

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-emerald-700 p-5 text-white">
        <p className="text-sm text-emerald-100">医疗资源</p>
        <h1 className="mt-2 text-2xl font-semibold">找医院、找医生、找社区</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          覆盖高新区三甲医院与社区卫生服务中心。
        </p>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索机构名称、地址、等级"
          className="h-10 rounded-lg bg-white pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-sm font-medium ring-1",
              filter === item.value
                ? "bg-emerald-600 text-white ring-emerald-600"
                : "bg-white text-slate-600 ring-emerald-100"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {visible.map((institution) => (
          <InstitutionCard key={institution.id} institution={institution} />
        ))}
      </section>
    </div>
  )
}
