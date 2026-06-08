import "dotenv/config"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

import {
  UserActionEventType,
  PrismaClient,
} from "../src/generated/prisma/client"
import { logUserAction } from "../src/lib/intent/action-logger"
import { analyzeResidentIntent } from "../src/lib/intent/intent-engine"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const zhang = await mustFindResident("张建国")
  const li = await mustFindResident("李秀兰")

  await resetResidentIntentDemo(zhang.id)
  await resetResidentIntentDemo(li.id)

  await logUserAction({
    residentId: zhang.id,
    eventType: UserActionEventType.SEARCH,
    eventName: "搜索胸闷胸痛",
    pagePath: "/gaoxin/ai",
    content: "胸闷胸痛是不是心脏病",
  })
  await logUserAction({
    residentId: zhang.id,
    eventType: UserActionEventType.AI_CHAT,
    eventName: "咨询小高健康助手",
    pagePath: "/gaoxin/pre-consult",
    content: "胸痛两小时，有高血压，想看心内科",
  })
  await logUserAction({
    residentId: zhang.id,
    eventType: UserActionEventType.DOCTOR_VIEW,
    eventName: "查看心血管医生",
    pagePath: "/gaoxin/resources/doctors/mock",
    content: "查看心血管专家但未挂号",
  })

  const zhangResult = await analyzeResidentIntent(zhang.id)

  await logUserAction({
    residentId: li.id,
    eventType: UserActionEventType.SEARCH,
    eventName: "搜索高血压复诊",
    pagePath: "/gaoxin/ai",
    content: "高血压复诊开药，降压药快吃完了",
  })
  await logUserAction({
    residentId: li.id,
    eventType: UserActionEventType.HEALTH_TASK_VIEW,
    eventName: "查看血压记录",
    pagePath: "/gaoxin/health-management?tab=blood-pressure",
    content: "查看血压记录和慢病管理",
  })

  const liResult = await analyzeResidentIntent(li.id)

  console.log("INTENT DEMO CHECK")
  console.log("=================")
  printResult("张建国", zhangResult)
  printResult("李秀兰", liResult)

  if (zhangResult.insights.length === 0 || zhangResult.leads.length === 0) {
    throw new Error("张建国意图洞察或服务线索未生成")
  }

  if (liResult.insights.length === 0 || liResult.leads.length === 0) {
    throw new Error("李秀兰意图洞察或服务线索未生成")
  }
}

async function mustFindResident(name: string) {
  const resident = await prisma.residentProfile.findFirst({
    where: { name },
    select: { id: true, name: true },
  })

  if (!resident) {
    throw new Error(`未找到居民：${name}`)
  }

  return resident
}

async function resetResidentIntentDemo(residentId: string) {
  const leads = await prisma.serviceLead.findMany({
    where: { residentId },
    select: { id: true },
  })
  await prisma.leadFeedback.deleteMany({
    where: { serviceLeadId: { in: leads.map((lead) => lead.id) } },
  })
  await prisma.serviceLead.deleteMany({ where: { residentId } })
  await prisma.intentInsight.deleteMany({ where: { residentId } })
}

function printResult(
  name: string,
  result: Awaited<ReturnType<typeof analyzeResidentIntent>>
) {
  console.log(`${name}:`)
  console.log(`  insights: ${result.insights.map((item) => `${item.intentType}/${item.priority}`).join("、")}`)
  console.log(`  leads: ${result.leads.map((item) => `${item.leadType}/${item.receiverType}/${item.status}`).join("、")}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
