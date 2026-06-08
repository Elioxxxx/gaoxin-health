import "dotenv/config"

import { InstitutionType } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { createPreConsultSession, runPreConsultSession } from "@/lib/pre-consult/session-service"

const demoCases = [
  {
    name: "胸闷胸痛",
    scenarioKey: "chest_pain_high_risk",
    input: "我胸口有点闷，还有轻微胸痛，大概两个小时了，以前有高血压。",
    expectedLevels: ["P0", "P1"],
    recommendationText: ["三甲", "心血管", "专家"],
    path: "/gaoxin/pre-consult?demo=chest-pain",
  },
  {
    name: "高血压复诊",
    scenarioKey: "hypertension_followup",
    input: "我有高血压，最近想复诊开药。",
    expectedLevels: ["P3"],
    recommendationText: ["社区", "慢病"],
    path: "/gaoxin/pre-consult?demo=hypertension",
  },
  {
    name: "儿童发热",
    scenarioKey: "child_fever",
    input: "孩子 5 岁，发热一天，目前没有抽搐。",
    expectedLevels: ["P2"],
    recommendationText: ["儿科"],
    path: "/gaoxin/pre-consult?demo=child-fever",
  },
  {
    name: "体检血糖偏高",
    scenarioKey: "high_glucose_exam",
    input: "体检发现血糖偏高，想知道该去哪看。",
    expectedLevels: ["P3", "P4"],
    recommendationText: ["慢病", "内分泌"],
    path: "/gaoxin/pre-consult?demo=blood-sugar",
  },
]

async function main() {
  const [
    tertiaryCount,
    communityCount,
    doctorCount,
    residentCount,
  ] = await Promise.all([
    prisma.institution.count({ where: { type: InstitutionType.TERTIARY_HOSPITAL } }),
    prisma.institution.count({ where: { type: InstitutionType.COMMUNITY_HEALTH_CENTER } }),
    prisma.doctor.count(),
    prisma.residentProfile.count(),
  ])

  assert(tertiaryCount >= 5, `三甲医院至少 5 家，当前 ${tertiaryCount}`)
  assert(communityCount >= 11, `社区卫生服务中心至少 11 家，当前 ${communityCount}`)
  assert(doctorCount >= 20, `医生至少 20 名，当前 ${doctorCount}`)
  assert(residentCount >= 4, `居民至少 4 个，当前 ${residentCount}`)

  const caseResults = []

  for (const demoCase of demoCases) {
    const session = await createPreConsultSession({
      scenarioKey: demoCase.scenarioKey,
      initialInput: demoCase.input,
    })
    const result = await runPreConsultSession(session.id)
    const agentRunCount = await prisma.agentRun.count({
      where: { sessionId: session.id },
    })
    const recommendationText = result.recommendations
      .map((recommendation) =>
        [
          recommendation.institution.name,
          recommendation.institution.type,
          recommendation.department.name,
          recommendation.doctor?.name,
          recommendation.doctor?.isExpert ? "专家" : "",
        ].join(" ")
      )
      .join(" ")

    assert(
      demoCase.expectedLevels.includes(result.triage.level),
      `${demoCase.name} 场景分诊等级不符合预期，当前 ${result.triage.level}`
    )
    assert(result.recommendations.length >= 3, `${demoCase.name} 应生成至少 3 条推荐`)
    assert(result.guidePlans.length > 0, `${demoCase.name} 应生成导诊指引`)
    assert(agentRunCount >= 6, `${demoCase.name} 应生成完整 AgentRun 日志`)
    assert(
      demoCase.recommendationText.some((keyword) => recommendationText.includes(keyword)),
      `${demoCase.name} 推荐结果未命中预期方向：${demoCase.recommendationText.join("/")}`
    )

    caseResults.push({
      name: demoCase.name,
      path: demoCase.path,
      sessionId: session.id,
      triageLevel: result.triage.level,
      recommendationCount: result.recommendations.length,
      guidePlan: result.guidePlans[0] ? "存在" : "不存在",
      agentRunCount,
    })
  }

  console.log("GAOXIN CHECK")
  console.log("============")
  for (const item of caseResults) {
    console.log(`${item.name}:`)
    console.log(`  path: ${item.path}`)
    console.log(`  sessionId: ${item.sessionId}`)
    console.log(`  triageLevel: ${item.triageLevel}`)
    console.log(`  recommendationCount: ${item.recommendationCount}`)
    console.log(`  guidePlan: ${item.guidePlan}`)
    console.log(`  agentRunCount: ${item.agentRunCount}`)
  }
  console.log("")
  console.log("融合版演示路径:")
  console.log("- /gaoxin")
  console.log("- /gaoxin/ai")
  console.log("- /gaoxin/mine")
  console.log("- /gaoxin/pre-consult?demo=chest-pain")
  console.log("- /gaoxin/pre-consult?demo=hypertension")
  console.log("- /gaoxin/pre-consult?demo=child-fever")
  console.log("- /gaoxin/pre-consult?demo=blood-sugar")
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
