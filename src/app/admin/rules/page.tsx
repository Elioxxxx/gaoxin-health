import { AdminPageHeader } from "@/components/admin/admin-section"
import { RuleManager } from "@/components/admin/admin-managers"
import { prisma } from "@/lib/db/prisma"

export default async function AdminRulesPage() {
  const rules = await prisma.triageRule.findMany({
    orderBy: { priority: "desc" },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader title="分诊规则" description="维护 P0-P4 分诊规则、建议科室和建议动作。" />
      <RuleManager items={JSON.parse(JSON.stringify(rules))} />
    </div>
  )
}
