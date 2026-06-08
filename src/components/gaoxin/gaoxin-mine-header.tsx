import { ChevronRight, UsersRound } from "lucide-react"

export function GaoxinMineHeader({
  name = "张建国",
  maskedId = "5101********1217",
}: {
  name?: string
  maskedId?: string
}) {
  return (
    <section className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#10b981,#67e8f9)] text-base font-semibold text-white shadow-sm">
            {name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-950">{name}</h1>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                本人
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{maskedId}</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-100"
        >
          <UsersRound className="size-3.5 text-emerald-600" />
          家庭成员管理
          <ChevronRight className="size-3.5 text-slate-400" />
        </button>
      </div>
    </section>
  )
}
