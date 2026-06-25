import { Activity, ClipboardList, HeartPulse, Play, ThermometerSun } from "lucide-react"

import { cn } from "@/lib/utils"

const iconByTitle = [
  { keyword: "血压", icon: HeartPulse },
  { keyword: "报告", icon: ClipboardList },
  { keyword: "儿童", icon: ThermometerSun },
  { keyword: "血糖", icon: Activity },
]

export function GaoxinVideoThumbnail({
  title,
  coverImageUrl,
  compact = false,
  className,
}: {
  title: string
  coverImageUrl?: string
  compact?: boolean
  className?: string
}) {
  const Icon = iconByTitle.find((item) => title.includes(item.keyword))?.icon ?? HeartPulse

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#7dd3c7_0%,#21b78c_54%,#8be1ff_100%)]",
        compact ? "h-20 w-24 shrink-0" : "h-32 w-full",
        className
      )}
    >
      {coverImageUrl ? (
        <>
          <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${escapeCssUrl(coverImageUrl)}")` }} />
          <div className="absolute inset-0 bg-slate-950/12" />
        </>
      ) : (
        <>
          <div className="absolute -left-5 -top-6 size-20 rounded-full bg-white/18" />
          <div className="absolute -bottom-8 right-0 size-24 rounded-full bg-emerald-950/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_65%,rgba(255,255,255,0.18),transparent_35%)]" />
          <div className="absolute left-4 top-4 flex size-12 items-center justify-center rounded-2xl bg-white/24 text-white backdrop-blur">
            <Icon className={compact ? "size-5" : "size-7"} />
          </div>
        </>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/28 text-white shadow-sm ring-1 ring-white/45 backdrop-blur">
          <Play className="ml-0.5 size-6 fill-white" />
        </span>
      </div>
    </div>
  )
}

function escapeCssUrl(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "%22")
}
