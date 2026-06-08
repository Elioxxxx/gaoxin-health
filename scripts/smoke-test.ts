import "dotenv/config"

import { createPreConsultSession, runPreConsultSession } from "@/lib/pre-consult/session-service"
import { prisma } from "@/lib/db/prisma"

async function main() {
  const resident = await prisma.residentProfile.findFirst({
    where: { name: "张建国" },
  })

  if (!resident) {
    throw new Error("Smoke test 需要先执行 pnpm db:seed")
  }

  const session = await createPreConsultSession({
    residentId: resident.id,
    initialInput: "胸闷胸痛2小时，既往高血压，现在有点出汗。",
  })
  const result = await runPreConsultSession(session.id)

  console.log("Smoke Test Result")
  console.log("=================")
  console.log(`居民：${resident.name}`)
  console.log(`分诊等级：${result.triage.level}`)
  console.log(`建议科室：${result.triage.suggestedDepartment}`)
  console.log("推荐结果：")

  for (const recommendation of result.recommendations) {
    console.log(
      `- #${recommendation.rank} ${recommendation.institution.name} / ${recommendation.department.name} / ${recommendation.doctor?.name ?? "暂不指定医生"} / ${recommendation.score}`
    )
  }

  if (result.triage.level !== "P1" && result.triage.level !== "P0") {
    throw new Error(`胸痛场景期望 P0/P1，实际为 ${result.triage.level}`)
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
