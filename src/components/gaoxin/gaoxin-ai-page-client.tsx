"use client"

import { useEffect, useState } from "react"

import { AiCapabilityGrid } from "@/components/gaoxin/ai-capability-grid"
import { AiHealthHero } from "@/components/gaoxin/ai-health-hero"
import { AiHealthSummaryCard } from "@/components/gaoxin/ai-health-summary-card"
import { AiInputBar } from "@/components/gaoxin/ai-input-bar"
import { AiQuestionList } from "@/components/gaoxin/ai-question-list"
import { GaoxinActionTracker } from "@/components/gaoxin/gaoxin-action-tracker"
import {
  adaptGaoxinHealthSummary,
  type GaoxinHealthSummaryView,
} from "@/lib/gaoxin/health-summary-adapter"

type ApiData<T> = {
  data: T
}

export function GaoxinAiPageClient() {
  const [summary, setSummary] = useState<GaoxinHealthSummaryView>(() =>
    adaptGaoxinHealthSummary(null)
  )
  const [summaryHint, setSummaryHint] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadSummary() {
      try {
        const response = await fetch("/api/residents/me/health-summary")

        if (!response.ok) {
          throw new Error("健康摘要加载失败")
        }

        const payload = (await response.json()) as ApiData<unknown>

        if (!ignore) {
          setSummary(adaptGaoxinHealthSummary(payload.data))
        }
      } catch {
        if (!ignore) {
          setSummaryHint("健康摘要暂时使用演示数据")
        }
      }
    }

    void loadSummary()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="-mx-3 -mb-5 min-h-[calc(100dvh-56px)] bg-[linear-gradient(180deg,#edf9f4_0%,#eef4ff_44%,#f5f6f8_100%)] px-3 pb-44 pt-1">
      <GaoxinActionTracker
        eventType="AI_CHAT"
        eventName="进入小高健康助手"
        content="查看 AI健康首页"
        targetType="gaoxin_ai"
      />
      <div className="space-y-3">
        <AiHealthHero memberName={summary.memberName} />
        {summaryHint ? (
          <p className="px-1 text-xs text-slate-400">{summaryHint}</p>
        ) : null}
        <AiHealthSummaryCard summary={summary} />
        <AiCapabilityGrid />
        <AiQuestionList />
      </div>
      <AiInputBar />
    </div>
  )
}
