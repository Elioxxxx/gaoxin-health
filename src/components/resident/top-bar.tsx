import Link from "next/link"
import { Bell, ChevronLeft, ShieldPlus } from "lucide-react"

type TopBarProps = {
  title?: string
  showBack?: boolean
}

export function TopBar({ title = "健康高新", showBack = false }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <Link
              href="/app"
              aria-label="返回首页"
              className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
              <ShieldPlus className="size-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950">
              {title}
            </p>
            <p className="text-xs text-emerald-700">成都高新区居民健康服务</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="通知"
          className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
        >
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  )
}
