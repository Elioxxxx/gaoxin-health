import { cn } from "@/lib/utils"

export function DoctorTriageBadge({ level }: { level?: string | null }) {
  const styles: Record<string, string> = {
    P0: "bg-red-600 text-white",
    P1: "bg-rose-600 text-white",
    P2: "bg-orange-500 text-white",
    P3: "bg-emerald-600 text-white",
    P4: "bg-sky-600 text-white",
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-12 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold",
        styles[level ?? ""] ?? "bg-slate-200 text-slate-700"
      )}
    >
      {level ?? "待定"}
    </span>
  )
}
