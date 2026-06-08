"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImagePlus, Mic, SendHorizonal } from "lucide-react"

import { LoadingSteps } from "@/components/resident/loading-steps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { detectScenario, type ScenarioKey, scenarioQuestions } from "@/lib/ai/scenarios"
import { demoScenarios } from "@/lib/demo-scenarios"

const loadingLabels = [
  "正在结构化采集主诉",
  "正在生成健康档案摘要",
  "正在进行 P0-P4 分诊",
  "正在匹配医院/科室/医生",
  "正在生成导诊指引",
]

type ApiData<T> = { data: T }

export default function PreConsultPage() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-4 text-sm text-slate-500">正在加载预问诊页面...</div>}>
      <PreConsultContent />
    </Suspense>
  )
}

function PreConsultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [input, setInput] = useState(searchParams.get("input") ?? demoScenarios[0].input)
  const [selectedScenarioKey, setSelectedScenarioKey] = useState(
    searchParams.get("scenario") as ScenarioKey | null
  )
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState("")
  const questions = useMemo(
    () => scenarioQuestions(detectScenario(input)).slice(0, 3),
    [input]
  )

  async function handleRun() {
    setLoading(true)
    setError("")
    setActiveStep(0)

    try {
      const sessionResponse = await postJson<ApiData<{ id: string }>>(
        "/api/pre-consult/sessions",
        {
          initialInput: input,
          scenarioKey: selectedScenarioKey ?? detectScenario(input),
        }
      )
      setActiveStep(1)
      await postJson(`/api/pre-consult/sessions/${sessionResponse.data.id}/messages`, {
        content: input,
      })
      setActiveStep(2)
      await postJson(`/api/pre-consult/sessions/${sessionResponse.data.id}/run`, {})
      setActiveStep(4)
      router.push(`/app/pre-consult/${sessionResponse.data.id}/result`)
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "分析失败，请稍后重试")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-emerald-700 p-5 text-white">
        <p className="text-sm text-emerald-100">智能预问诊</p>
        <h1 className="mt-2 text-2xl font-semibold">先说症状，再帮您导诊</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          系统会结合 Mock 健康档案生成预问诊报告、分诊等级和推荐资源。
        </p>
      </section>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">演示输入一键填充</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {demoScenarios.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setInput(item.input)
                setSelectedScenarioKey(item.key)
              }}
              className="rounded-lg bg-emerald-50 px-3 py-3 text-left text-sm font-medium text-emerald-800 ring-1 ring-emerald-100"
            >
              <span className="block text-xs text-emerald-600">{item.resident}</span>
              {item.title}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border-emerald-100 bg-white">
        <CardHeader>
          <CardTitle className="text-base">症状描述</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            您可以描述症状、持续时间、既往病史和当前用药。
          </div>
          <Textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setSelectedScenarioKey(null)
            }}
            rows={5}
            className="min-h-28 rounded-lg bg-white"
            placeholder="例如：胸闷胸痛2小时，既往高血压..."
          />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline">
              <ImagePlus className="size-4" />
              上传图片
            </Button>
            <Button type="button" variant="outline">
              <Mic className="size-4" />
              语音输入
            </Button>
          </div>
          <div className="rounded-lg bg-sky-50 p-3">
            <p className="text-sm font-medium text-sky-900">系统追问卡片</p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-sky-800">
              {questions.map((question) => (
                <li key={question}>· {question}</li>
              ))}
            </ul>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button
            type="button"
            className="w-full"
            disabled={loading || input.trim().length === 0}
            onClick={handleRun}
          >
            <SendHorizonal className="size-4" />
            开始分析
          </Button>
        </CardContent>
      </Card>

      {loading ? <LoadingSteps activeIndex={activeStep} steps={loadingLabels} /> : null}
    </div>
  )
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }

  return (await response.json()) as T
}
