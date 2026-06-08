import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { GaoxinServiceIcon } from "@/components/gaoxin/gaoxin-service-icon"
import { cn } from "@/lib/utils"

type ServiceItem = {
  title?: string
  label?: string
  href: string
  icon: LucideIcon
  badge?: string
  disabled?: boolean
  tone?: "emerald" | "cyan" | "sky" | "amber" | "violet" | "slate"
}

type GaoxinServiceSectionProps = {
  title: string
  items: ServiceItem[]
  highlight?: boolean
  badge?: string
  moreHref?: string
  moreLabel?: string
  columns?: 3 | 4
}

export function GaoxinServiceSection({
  title,
  items,
  highlight = false,
  badge,
  moreHref,
  moreLabel = "查看更多",
  columns = 4,
}: GaoxinServiceSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100",
        highlight && "bg-emerald-50/80 ring-emerald-100"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <div className="flex items-center gap-2">
          {badge ? (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
              {badge}
            </span>
          ) : null}
          {moreHref ? (
            <Link href={moreHref} className="text-xs font-medium text-slate-400">
              {moreLabel}
            </Link>
          ) : null}
        </div>
      </div>
      <div className={columns === 3 ? "grid grid-cols-3 gap-x-2 gap-y-4" : "grid grid-cols-4 gap-x-2 gap-y-4"}>
        {items.map((item) => (
          <GaoxinServiceIcon key={`${title}-${item.title ?? item.label}`} {...item} />
        ))}
      </div>
    </section>
  )
}
