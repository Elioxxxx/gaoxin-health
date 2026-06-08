import { Bot, GitBranch, RotateCcw, SlidersHorizontal } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-section"
import { StatCard } from "@/components/admin/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db/prisma"

export default async function AdminModelConfigPage() {
  const [model, prompts] = await Promise.all([
    prisma.modelVersion.findFirst({ where: { isActive: true } }),
    prisma.promptTemplate.findMany({ orderBy: { createdAt: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="模型配置" description="第一版展示 Mock Provider 与 Prompt 模板，预留真实模型、灰度和回滚能力。" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="当前 Provider" value="MockAiProvider" icon={Bot} tone="indigo" />
        <StatCard title="当前模型版本" value={model?.version ?? "v0.1"} icon={SlidersHorizontal} tone="emerald" />
        <StatCard title="未来可扩展" value="真实 Provider" icon={GitBranch} tone="sky" />
        <StatCard title="版本回滚" value="预留" icon={RotateCcw} tone="amber" />
      </section>
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
