import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"

export function DoctorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <div className="flex min-h-dvh">
        <DoctorSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <p className="text-sm text-slate-500">预问诊报告、健康档案摘要与医生反馈</p>
            <h1 className="mt-1 text-xl font-semibold">健康高新医生端</h1>
          </header>
          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
