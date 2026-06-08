"use client"

import Link from "next/link"
import { FileText, HeartPulse, Home, Hospital, UserRound } from "lucide-react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", label: "首页", icon: Home, exact: true },
  { href: "/app/pre-consult", label: "预问诊", icon: FileText },
  { href: "/app/health-record", label: "健康档案", icon: HeartPulse },
  { href: "/app/resources", label: "医疗资源", icon: Hospital },
  { href: "/app/health-management", label: "我的", icon: UserRound },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-emerald-100 bg-white px-1 py-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] font-medium text-slate-500",
              active && "bg-emerald-50 text-emerald-700"
            )}
          >
            <Icon className="size-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
