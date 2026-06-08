import { CheckCircle2, CircleDot } from "lucide-react"

const defaultSteps = [
  "正在结构化采集主诉",
  "正在生成健康档案摘要",
  "正在生成就医建议",
  "正在匹配医院/科室/医生",
  "正在生成导诊指引",
]

export function GaoxinLoadingSteps({
  activeIndex = 0,
  steps = defaultSteps,
}: {
  activeIndex?: number
  steps?: string[]
}) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-base font-semibold text-slate-950">小高健康助手处理中</h2>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const done = index < activeIndex
          const active = index === activeIndex

          return (
            <div key={step} className="flex items-center gap-3">
              {done ? (
                <CheckCircle2 className="size-5 text-emerald-600" />
              ) : (
                <CircleDot className={active ? "size-5 text-emerald-600" : "size-5 text-slate-300"} />
              )}
              <span className={active || done ? "text-sm font-medium text-slate-800" : "text-sm text-slate-400"}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
