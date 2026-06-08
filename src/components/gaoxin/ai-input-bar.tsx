"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Camera, Mic, Plus, SendHorizonal } from "lucide-react"

import { resolveGaoxinAiInputTarget } from "@/lib/gaoxin/ai-input-router"
import { trackUserAction } from "@/lib/intent/client-action"

const shortcutItems = [
  { label: "AI导诊", href: "/gaoxin/pre-consult" },
  { label: "拍报告", href: "/gaoxin/report-ai" },
  { label: "就医服务", href: "/gaoxin/resources" },
  { label: "健康档案", href: "/gaoxin/health-record" },
]

export function AiInputBar() {
  const router = useRouter()
  const [input, setInput] = useState("")

  function handleSubmit() {
    const text = input.trim()

    if (!text) {
      return
    }

    trackUserAction({
      eventType: text.includes("报告") ? "REPORT_INTERPRET" : "AI_CHAT",
      eventName: "小高健康助手输入问题",
      content: text,
      targetType: "ai_health_input",
    })
    router.push(resolveGaoxinAiInputTarget(text))
  }

  return (
    <div className="fixed bottom-[76px] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-3">
      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {shortcutItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() =>
              trackUserAction({
                eventType: item.label === "拍报告" ? "REPORT_VIEW" : item.label === "健康档案" ? "HEALTH_RECORD_VIEW" : "RESOURCE_VIEW",
                eventName: `AI健康快捷入口：${item.label}`,
                content: item.label,
                metadata: { href: item.href },
              })
            }
            className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100 backdrop-blur"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-[24px] bg-white/95 p-2 shadow-[0_10px_28px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 backdrop-blur">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-emerald-600"
          aria-label="语音输入"
        >
          <Mic className="size-4" />
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit()
            }
          }}
          placeholder="发消息或按住说话，描述症状、报告或健康问题"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500"
          aria-label="添加"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500"
          aria-label="拍照"
        >
          <Camera className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
          aria-label="发送"
        >
          <SendHorizonal className="size-4" />
        </button>
      </div>
    </div>
  )
}
