import { QrCode } from "lucide-react"

export function GaoxinHealthCard({
  name = "张建国",
  maskedId = "5101********1217",
  maskedPhone = "138****0001",
  relation = "本人",
  variant = "home",
}: {
  name?: string
  maskedId?: string
  maskedPhone?: string
  relation?: string
  variant?: "home" | "mine"
}) {
  const qrSize = variant === "mine" ? "size-24" : "size-20"

  if (variant === "mine") {
    return (
      <section className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-emerald-700">电子健康卡</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                {relation}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{name}</h2>
            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
              <p>
                身份证号
                <span className="ml-2 font-medium text-slate-800">{maskedId}</span>
              </p>
              <p>
                手机号码
                <span className="ml-2 font-medium text-slate-800">{maskedPhone}</span>
              </p>
            </div>
          </div>
          <div className={`flex ${qrSize} shrink-0 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100`}>
            <QrCode className="size-12 text-slate-700" />
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1">
          <span className="size-1.5 rounded-full bg-slate-900" />
          <span className="size-1.5 rounded-full bg-slate-300" />
          <span className="size-1.5 rounded-full bg-slate-300" />
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100">
      <div className="bg-[linear-gradient(135deg,#14b885,#37d0a3)] px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-50">电子健康卡</p>
            <h2 className="mt-1 text-xl font-semibold">{name}</h2>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs">
            {relation}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="space-y-2 text-xs leading-5 text-slate-500">
          <p>
            身份证号
            <span className="ml-2 font-medium text-slate-800">{maskedId}</span>
          </p>
          <p>
            手机号码
            <span className="ml-2 font-medium text-slate-800">{maskedPhone}</span>
          </p>
          <div className="flex gap-1 pt-1">
            <span className="size-1.5 rounded-full bg-slate-900" />
            <span className="size-1.5 rounded-full bg-slate-300" />
            <span className="size-1.5 rounded-full bg-slate-300" />
          </div>
        </div>
        <div className={`flex ${qrSize} shrink-0 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100`}>
          <QrCode className="size-12 text-slate-700" />
        </div>
      </div>
    </section>
  )
}
