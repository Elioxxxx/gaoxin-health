"use client"

import Link from "next/link"
import { ChevronRight, MessageCircleQuestion } from "lucide-react"

import { trackUserAction } from "@/lib/intent/client-action"

const questions = [
  {
    title: "胸闷胸痛应该去哪看？",
    href: "/gaoxin/pre-consult?demo=chest-pain",
  },
  {
    title: "血压高怎么复诊？",
    href: "/gaoxin/pre-consult?demo=hypertension",
  },
  {
    title: "体检血糖偏高怎么办？",
    href: "/gaoxin/pre-consult?demo=blood-sugar",
  },
  {
    title: "儿童发热要不要去医院？",
    href: "/gaoxin/pre-consult?demo=child-fever",
  },
]

export function AiQuestionList() {
  return (
    <section className="rounded-[26px] bg-white/90 p-4 shadow-sm ring-1 ring-white">
      <div className="mb-3 flex items-center gap-2">
        <MessageCircleQuestion className="size-5 text-emerald-600" />
        <h2 className="text-base font-semibold text-slate-950">推荐问题</h2>
      </div>
      <div className="space-y-2">
        {questions.map((question) => (
          <Link
            key={question.title}
            href={question.href}
            onClick={() =>
              trackUserAction({
                eventType: "AI_CHAT",
                eventName: "点击推荐问题",
                content: question.title,
                targetType: "recommended_question",
                metadata: { href: question.href },
              })
            }
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 active:bg-emerald-50"
          >
            {question.title}
            <ChevronRight className="size-4 text-slate-300" />
          </Link>
        ))}
      </div>
    </section>
  )
}
