import { AdminPageHeader } from "@/components/admin/admin-section"
import { QualityClient } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminQualityPage() {
  const [issues, feedback] = await Promise.all([
    prisma.qualityIssue.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.agentFeedback.findMany({ orderBy: { createdAt: "desc" } }),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="质量反馈" description="汇总医生反馈、错误案例和质量问题处理状态。" />
      <QualityClient
        issues={JSON.parse(JSON.stringify(issues))}
        feedback={JSON.parse(JSON.stringify(feedback))}
      />
    </div>
  )
}
