import { AlertTriangle, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

const styles = {
  P0: "bg-red-600 text-white",
  P1: "bg-rose-600 text-white",
  P2: "bg-orange-500 text-white",
  P3: "bg-emerald-600 text-white",
  P4: "bg-sky-600 text-white",
}

export function TriageLevelBadge({ level }: { level: string }) {
  const highRisk = level === "P0" || level === "P1"
  const Icon = highRisk ? AlertTriangle : CheckCircle2

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold",
        styles[level as keyof typeof styles] ?? "bg-slate-700 text-white"
      )}
    >
      <Icon className="size-4" />
      {level}
    </span>
  )
}
