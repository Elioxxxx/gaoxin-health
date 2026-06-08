import { AdminPageHeader } from "@/components/admin/admin-section"
import { AgentRunsClient } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminAgentRunsPage() {
  const runs = await prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Agent 日志" description="查看预问诊、摘要、分诊、推荐、导诊等 Agent 的输入输出和耗时。" />
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <AgentRunsClient items={JSON.parse(JSON.stringify(runs))} />
      </div>
    </div>
  )
}
