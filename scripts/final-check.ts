import "dotenv/config"

import { InstitutionType } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { createPreConsultSession, runPreConsultSession } from "@/lib/pre-consult/session-service"

async function main() {
  const [
    tertiaryCount,
    communityCount,
    doctorCount,
    residentCount,
    triageRuleCount,
  ] = await Promise.all([
    prisma.institution.count({ where: { type: InstitutionType.TERTIARY_HOSPITAL } }),
    prisma.institution.count({ where: { type: InstitutionType.COMMUNITY_HEALTH_CENTER } }),
    prisma.doctor.count(),
    prisma.residentProfile.count(),
    prisma.triageRule.count(),
  ])

  assert(tertiaryCount === 5, `三甲医院数量应为 5，当前 ${tertiaryCount}`)
  assert(communityCount === 11, `社区卫生服务中心数量应为 11，当前 ${communityCount}`)
  assert(doctorCount >= 20, `医生数量至少 20，当前 ${doctorCount}`)
  assert(residentCount >= 4, `居民数量至少 4 个，当前 ${residentCount}`)
  assert(triageRuleCount >= 6, `分诊规则至少 6 条，当前 ${triageRuleCount}`)

  const resident = await prisma.residentProfile.findFirst({
    where: { name: "张建国" },
  })
  assert(!!resident, "未找到演示居民张建国")

  const session = await createPreConsultSession({
    residentId: resident.id,
    initialInput: "我胸口有点闷，还有轻微胸痛，大概两个小时了，以前有高血压。",
  })
  const result = await runPreConsultSession(session.id)
  const agentRunCount = await prisma.agentRun.count({
    where: { sessionId: session.id },
  })

  console.log("FINAL CHECK")
  console.log("===========")
  console.log(`sessionId: ${session.id}`)
  console.log(`triageLevel: ${result.triage.level}`)
  console.log("recommendations:")
  for (const recommendation of result.recommendations) {
    console.log(
      `- ${recommendation.rank}. ${recommendation.institution.name} / ${recommendation.department.name} / ${recommendation.doctor?.name ?? "暂不指定医生"} / ${recommendation.score}`
    )
  }
  console.log(
    `guidePlan: ${result.guidePlans[0]?.title ?? "无"} - ${result.guidePlans[0]?.navigationText ?? "无"}`
  )
  console.log(`agentRunCount: ${agentRunCount}`)

  assert(["P0", "P1"].includes(result.triage.level), "胸痛场景应为 P0/P1")
  assert(result.recommendations.length >= 3, "应生成至少 3 条推荐")
  assert(result.guidePlans.length >= 1, "应生成导诊方案")
  assert(agentRunCount >= 6, "完整链路应生成多个 AgentRun")
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
