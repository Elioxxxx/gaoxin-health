import Link from "next/link"
import { ArrowRight, Bot, HeartPulse } from "lucide-react"

export function GaoxinAiAssistantCard({
  tertiaryCount,
  communityCount,
  expertCount,
}: {
  tertiaryCount?: number
  communityCount?: number
  expertCount?: number
}) {
  const statsReady =
    typeof tertiaryCount === "number" &&
    typeof communityCount === "number" &&
    typeof expertCount === "number"
  const demoLinks = [
    { label: "胸闷胸痛", href: "/gaoxin/pre-consult?demo=chest-pain" },
    { label: "高血压复诊", href: "/gaoxin/pre-consult?demo=hypertension" },
    { label: "儿童发热", href: "/gaoxin/pre-consult?demo=child-fever" },
    { label: "血糖偏高", href: "/gaoxin/pre-consult?demo=blood-sugar" },
  ]

  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#ecfdf5_0%,#f7fffb_48%,#eff6ff_100%)] p-4 shadow-sm ring-1 ring-emerald-100">
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-emerald-200/35" />
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Bot className="size-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950">小高健康助手</h2>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                新增
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              症状不知道去哪看？报告看不懂？血压血糖异常不知道怎么办？
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["AI导诊", "报告解读", "健康档案", "健康管理"].map((item) => (
            <span
              key={item}
              className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-white/80 p-3 text-xs text-slate-600 ring-1 ring-white">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <HeartPulse className="size-4 text-emerald-600" />
            高新区医疗资源接入
          </div>
          <p className="mt-1">
            {statsReady
              ? `${tertiaryCount} 家三甲医院、${communityCount} 家社区卫生服务中心、${expertCount} 名专家池医生可用于导诊推荐。`
              : "医疗资源数据加载失败，当前可继续使用智能预问诊演示。"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href="/gaoxin/ai"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm"
          >
            立即咨询
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/gaoxin/pre-consult?demo=chest-pain"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100"
          >
            试试胸闷胸痛
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {demoLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl bg-white/90 px-2 py-2 text-center text-[11px] font-semibold leading-4 text-emerald-700 ring-1 ring-emerald-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
