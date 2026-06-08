"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Home, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

const tabs = [
  { href: "/gaoxin", label: "首页", icon: Home, exact: true },
  { href: "/gaoxin/ai", label: "AI健康", icon: Bot },
  { href: "/gaoxin/mine", label: "我的", icon: UserRound },
]

export function GaoxinTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-slate-100 bg-white/95 px-7 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-medium transition",
                active ? "text-emerald-600" : "text-slate-400"
              )}
            >
              <Icon className={cn("size-5", active && "fill-emerald-50")} />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
