import { CheckCircle2 } from "lucide-react"

export function GuideStepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            {index + 1}
          </div>
          <div className="flex-1 rounded-lg bg-white p-3 text-sm leading-6 text-slate-700 ring-1 ring-emerald-100">
            <div className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              {step}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
