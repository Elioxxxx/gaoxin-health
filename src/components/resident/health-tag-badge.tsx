import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function HealthTagBadge({
  children,
  tone = "emerald",
}: {
  children: React.ReactNode
  tone?: "emerald" | "amber" | "rose" | "sky" | "slate"
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  }

  return (
    <Badge
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium ring-1 hover:bg-inherit",
        tones[tone]
      )}
    >
      {children}
    </Badge>
  )
}
