import { Bot, GitBranch, RotateCcw, SlidersHorizontal } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-section"
import { StatCard } from "@/components/admin/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProductionReadinessReport, getRuntimeConfig } from "@/lib/config/runtime"
import { prisma } from "@/lib/db/prisma"

export default async function AdminModelConfigPage() {
  const runtimeConfig = getRuntimeConfig()
  const readiness = getProductionReadinessReport(runtimeConfig)
  const [model, prompts] = await Promise.all([
    prisma.modelVersion.findFirst({ where: { isActive: true } }),
    prisma.promptTemplate.findMany({ orderBy: { createdAt: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="模型配置" description="展示 AI Gateway、Provider、模型版本和生产化配置检查。" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="当前 Provider" value={runtimeConfig.aiProvider} icon={Bot} tone="indigo" />
        <StatCard title="当前模型版本" value={runtimeConfig.aiModel || model?.version || "v0.1"} icon={SlidersHorizontal} tone="emerald" />
        <StatCard title="数据接入模式" value={runtimeConfig.medicalDataSource} icon={GitBranch} tone="sky" />
        <StatCard title="配置检查" value={readiness.hasBlockingIssue ? "需处理" : "可运行"} icon={RotateCcw} tone="amber" />
      </section>
      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">生产化配置检查</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {readiness.checks.map((check) => (
            <div key={check.key} className="rounded-lg border border-slate-100 p-3">
              <p className="text-sm font-medium text-slate-950">
                {check.severity === "blocking" ? "阻塞项" : check.severity === "warning" ? "提醒项" : "通过"} · {check.key}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{check.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">Prompt 模板列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-slate-950">{prompt.name}</p>
                <span className="text-xs text-slate-500">{prompt.agentName} · {prompt.version}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{prompt.template}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
