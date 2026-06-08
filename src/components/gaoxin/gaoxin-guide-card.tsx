import { CheckCircle2 } from "lucide-react"

export function GaoxinGuideCard({ steps }: { steps: string[] }) {
  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-base font-semibold text-slate-950">个性化导诊步骤</h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {index + 1}
            </span>
            <div className="flex-1 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {step}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
