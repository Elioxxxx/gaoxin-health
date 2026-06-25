"use client"

import { GaoxinTabBar } from "@/components/gaoxin/gaoxin-tab-bar"
import { GaoxinTopBar } from "@/components/gaoxin/gaoxin-top-bar"
import { usePathname } from "next/navigation"

export function GaoxinMiniShell({
  children,
  showTabBar = true,
  title,
}: {
  children: React.ReactNode
  showTabBar?: boolean
  title?: string
}) {
  const pathname = usePathname()
  const isVideoPage = pathname.startsWith("/gaoxin/videos")
  const resolvedShowTabBar = showTabBar && !isVideoPage

  return (
    <div className="min-h-dvh bg-[#e8f1ee] text-slate-950">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-hidden bg-[#f5f6f8] shadow-[0_0_36px_rgba(15,118,110,0.14)]">
        <GaoxinTopBar title={title} />
        <main className={isVideoPage ? "flex-1 px-0 pb-0" : resolvedShowTabBar ? "flex-1 px-3 pb-28" : "flex-1 px-3 pb-5"}>
          {children}
        </main>
        {resolvedShowTabBar ? <GaoxinTabBar /> : null}
      </div>
    </div>
  )
}
