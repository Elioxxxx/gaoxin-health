"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Stethoscope,
  UsersRound,
} from "lucide-react"

const navItems = [
  { href: "/doctor", label: "工作台", icon: LayoutDashboard },
  { href: "/doctor/schedule", label: "今日接诊", icon: CalendarDays },
  { href: "/doctor/service-leads", label: "服务线索", icon: UsersRound },
  { href: "/doctor/reports", label: "患者报告", icon: ClipboardList },
  { href: "/doctor/feedback", label: "反馈记录", icon: MessageSquareText },
]

export function DoctorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sky-700 text-white">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">医生工作台</p>
            <p className="text-xs text-slate-500">健康高新智能导诊</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active =
            item.href === "/doctor" ? pathname === "/doctor" : pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-sky-50 text-sky-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
