import Link from "next/link"
import { Home, Hospital, Stethoscope, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", label: "首页", icon: Home },
  { href: "/app", label: "导诊", icon: Stethoscope },
  { href: "/app", label: "资源", icon: Hospital },
  { href: "/app", label: "档案", icon: UserRound },
]

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col border-x border-slate-200 bg-slate-50 shadow-sm">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <p className="text-xs font-medium text-emerald-700">健康高新</p>
          <h1 className="text-lg font-semibold text-slate-950">
            成都高新区居民健康服务
          </h1>
        </header>
        <main className="flex-1 px-4 py-5">{children}</main>
        <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-slate-500",
                  item.label === "首页" && "bg-emerald-50 text-emerald-700"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
