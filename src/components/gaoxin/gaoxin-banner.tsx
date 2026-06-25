import { Sparkles } from "lucide-react"

export function GaoxinBanner() {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#0aa77a_0%,#32c9a1_52%,#78d8ff_100%)] px-5 py-4 text-white shadow-[0_12px_28px_rgba(16,185,129,0.2)]">
      <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/18" />
      <div className="absolute -bottom-16 right-3 size-32 rounded-full bg-emerald-100/20" />
      <div className="relative z-10">
        <div className="mb-2 flex w-fit items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-xs text-emerald-50 backdrop-blur">
          <Sparkles className="size-3.5" />
          高新健康融合服务
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-[30px] font-semibold leading-tight tracking-normal">健康高新</h1>
          <p className="text-sm font-medium text-emerald-50">居民智能健康服务入口</p>
        </div>
        <p className="mt-1 text-xs font-medium text-white/90">
          AI健康｜健康科普｜健康档案｜就医服务
        </p>
      </div>
    </section>
  )
}
