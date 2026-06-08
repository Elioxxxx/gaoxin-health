import { Bot, ChevronDown, Stethoscope } from "lucide-react"

export function AiHealthHero({ memberName = "张建国" }: { memberName?: string }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#dbfbe9_0%,#eaf7ff_52%,#f3edff_100%)] px-5 py-5 shadow-sm ring-1 ring-white/70">
      <div className="absolute -right-12 -top-12 size-36 rounded-full bg-white/35" />
      <div className="absolute bottom-4 right-4 flex size-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#16b981,#6d8cff)] shadow-[0_16px_36px_rgba(79,70,229,0.18)]">
        <div className="flex size-20 items-center justify-center rounded-full bg-white/90 text-emerald-600">
          <Bot className="size-10" />
        </div>
      </div>
      <div className="relative z-10 max-w-[255px]">
        <p className="text-sm font-medium text-emerald-700">下午好</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
          愿您健康快乐每一天
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          小高健康助手可帮您进行 AI导诊、报告解读和健康建议整理。
        </p>
        <div className="mt-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Stethoscope className="size-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">当前成员</p>
            <p className="text-sm font-semibold text-slate-900">{memberName}</p>
          </div>
          <button
            type="button"
            className="ml-1 inline-flex h-7 items-center gap-1 rounded-full bg-white/80 px-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100"
          >
            切换成员
            <ChevronDown className="size-3" />
          </button>
        </div>
      </div>
    </section>
  )
}
