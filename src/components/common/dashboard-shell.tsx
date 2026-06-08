import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type DashboardNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

type DashboardShellProps = {
  title: string
  description: string
  navItems: DashboardNavItem[]
  children: React.ReactNode
}

export function DashboardShell({
  title,
  description,
  navItems,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <div className="flex min-h-dvh">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
          <div className="px-2 pb-5">
            <p className="text-xs font-medium text-sky-700">健康高新</p>
            <h1 className="mt-1 text-lg font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                    index === 0 && "bg-sky-50 text-sky-800"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <p className="text-sm text-slate-500">{description}</p>
            <h2 className="mt-1 text-xl font-semibold">{title}</h2>
          </header>
          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
