"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImagePlus, Mic, SendHorizonal, Sparkles } from "lucide-react"

import { GaoxinLoadingSteps } from "@/components/gaoxin/gaoxin-loading-steps"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  gaoxinPreConsultDemos,
  getGaoxinPreConsultDemo,
  getScenarioKeyByInput,
  runGaoxinPreConsult,
} from "@/lib/gaoxin/pre-consult-adapter"
import { trackUserAction } from "@/lib/intent/client-action"
import { cn } from "@/lib/utils"

export function GaoxinPreConsultClient() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[24px] bg-white p-4 text-sm text-slate-500">
          正在加载智能预问诊...
        </div>
      }
    >
      <GaoxinPreConsultContent />
    </Suspense>
  )
}

function GaoxinPreConsultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const demo = getGaoxinPreConsultDemo(searchParams.get("demo"))
  const inputFromUrl = searchParams.get("input")
  const [input, setInput] = useState(inputFromUrl ?? demo?.input ?? "")
  const [scenarioKey, setScenarioKey] = useState<string | undefined>(demo?.scenarioKey)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState("")
  const selectedDemo = useMemo(
    () => gaoxinPreConsultDemos.find((item) => item.input === input),
    [input]
  )

  async function handleRun() {
    const content = input.trim()

    if (!content) {
      setError("请先描述您的症状或想咨询的问题")
      return
    }

    setLoading(true)
    setError("")
    setActiveStep(0)
    trackUserAction({
      eventType: "AI_CHAT",
      eventName: "开始智能预问诊",
      content,
      targetType: "pre_consult",
      metadata: { scenarioKey: scenarioKey ?? getScenarioKeyByInput(content) },
    })

    let timer: number | undefined
    try {
      timer = window.setInterval(() => {
        setActiveStep((current) => Math.min(current + 1, 4))
      }, 450)
      const sessionId = await runGaoxinPreConsult({
        content,
        scenarioKey: scenarioKey ?? getScenarioKeyByInput(content),
      })
      window.clearInterval(timer)
      setActiveStep(4)
      router.push(`/gaoxin/pre-consult/${sessionId}/result`)
    } catch (runError) {
      if (timer) {
        window.clearInterval(timer)
      }
      setError(runError instanceof Error ? runError.message : "智能预问诊失败，请稍后重试")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#ecfdf5,#eff6ff)] p-5 shadow-sm ring-1 ring-white">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">智能预问诊</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              小高健康助手会根据您的描述，结合健康档案摘要，为您生成导诊建议。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-semibold text-slate-950">演示问题</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {gaoxinPreConsultDemos.map((item) => (
            <button
              key={item.demo}
              type="button"
              onClick={() => {
                setInput(item.input)
                setScenarioKey(item.scenarioKey)
                trackUserAction({
                  eventType: "AI_CHAT",
                  eventName: "选择预问诊演示问题",
                  content: item.input,
                  targetType: "pre_consult_demo",
                  metadata: { demo: item.demo, scenarioKey: item.scenarioKey },
                })
              }}
              className={cn(
                "rounded-2xl px-3 py-3 text-left text-sm font-semibold ring-1 transition",
                selectedDemo?.demo === item.demo
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-emerald-50 text-emerald-800 ring-emerald-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-semibold text-slate-950">描述问题</h2>
        <Textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            setScenarioKey(undefined)
          }}
          rows={6}
          placeholder="请描述您的症状、持续时间、既往病史或想咨询的问题"
          className="mt-3 min-h-32 rounded-2xl border-slate-100 bg-slate-50 text-sm"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-10 rounded-full">
            <ImagePlus className="size-4" />
            图片上传
          </Button>
          <Button type="button" variant="outline" className="h-10 rounded-full">
            <Mic className="size-4" />
            语音输入
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <Button
          type="button"
          disabled={loading}
          onClick={handleRun}
          className="mt-4 h-11 w-full rounded-full bg-emerald-600 text-white"
        >
          <SendHorizonal className="size-4" />
          开始分析
        </Button>
      </section>

      {loading ? <GaoxinLoadingSteps activeIndex={activeStep} /> : null}
    </div>
  )
}
