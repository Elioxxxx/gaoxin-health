import { BottomNav } from "@/components/resident/bottom-nav"
import { TopBar } from "@/components/resident/top-bar"

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#e8f5ef] text-slate-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#f7fbf8] shadow-[0_0_32px_rgba(15,118,110,0.12)]">
        <TopBar />
        <main className="flex-1 px-4 py-4">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
