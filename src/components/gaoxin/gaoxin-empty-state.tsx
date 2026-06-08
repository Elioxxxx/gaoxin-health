import Link from "next/link"
import { Construction } from "lucide-react"

export function GaoxinEmptyState({
  title,
  description = "该服务将在后续版本接入，本轮先保留小程序入口和页面承接。",
}: {
  title: string
  description?: string
}) {
  return (
    <section className="mt-4 rounded-[24px] bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Construction className="size-7" />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <Link
        href="/gaoxin"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white"
      >
        返回健康高新首页
      </Link>
    </section>
  )
}
