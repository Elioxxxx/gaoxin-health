import { AdminSidebar } from "@/components/admin/admin-sidebar"

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <div className="flex min-h-dvh">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <p className="text-sm text-slate-500">
              区域医疗资源、分诊规则、知识库、Agent 质量与运行数据
            </p>
            <h1 className="mt-1 text-xl font-semibold">成都高新区卫健管理后台</h1>
          </header>
          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
