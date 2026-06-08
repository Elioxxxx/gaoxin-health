import { Sparkles, Stethoscope } from "lucide-react"

export function GaoxinBanner() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0aa77a_0%,#32c9a1_48%,#78d8ff_100%)] px-5 py-5 text-white shadow-[0_12px_28px_rgba(16,185,129,0.22)]">
      <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/18" />
      <div className="absolute -bottom-14 right-10 size-28 rounded-full bg-emerald-100/20" />
      <div className="relative z-10 max-w-[270px]">
        <div className="mb-3 flex w-fit items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-xs text-emerald-50 backdrop-blur">
          <Sparkles className="size-3.5" />
          高新健康融合服务
        </div>
        <h1 className="text-2xl font-semibold tracking-normal">健康高新</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          居民健康服务与智能导诊入口
        </p>
        <p className="mt-3 text-xs font-medium text-white/90">
          AI导诊｜健康档案｜报告解读｜慢病管理
        </p>
      </div>
      <div className="absolute bottom-5 right-5 flex size-20 items-center justify-center rounded-[24px] bg-white/20 backdrop-blur">
        <Stethoscope className="size-10 text-white" />
      </div>
    </section>
  )
}
