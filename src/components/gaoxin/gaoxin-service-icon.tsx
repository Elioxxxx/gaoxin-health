import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type GaoxinServiceIconProps = {
  href: string
  title?: string
  label?: string
  icon: LucideIcon
  badge?: string
  disabled?: boolean
  tone?: "emerald" | "cyan" | "sky" | "amber" | "violet" | "slate"
  onSelect?: () => void
}

const tones = {
  emerald: "bg-emerald-50 text-emerald-600",
  cyan: "bg-cyan-50 text-cyan-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-50 text-slate-700",
}

export function GaoxinServiceIcon({
  href,
  title,
  label,
  icon: Icon,
  badge,
  disabled = false,
  tone = "emerald",
  onSelect,
}: GaoxinServiceIconProps) {
  const text = title ?? label ?? "服务"
  const content = (
    <>
      <span
        className={cn(
          "relative flex size-12 items-center justify-center rounded-2xl transition group-active:scale-95",
          disabled && "grayscale opacity-60 group-active:scale-100",
          tones[tone]
        )}
      >
        <Icon className="size-5" />
        {badge ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={cn("text-xs font-medium leading-4 text-slate-700", disabled && "text-slate-400")}>
        {text}
      </span>
    </>
  )

  if (disabled) {
    return <div className="group flex flex-col items-center gap-2 text-center">{content}</div>
  }

  return (
    <Link
      href={href}
      onClick={onSelect}
      className="group flex flex-col items-center gap-2 text-center"
    >
      {content}
    </Link>
  )
}
