import "dotenv/config"

import {
  IntentType,
  LeadReceiverType,
  RiskFocusCategory,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { analyzeResidentIntent } from "@/lib/intent/intent-engine"

const requiredPatients = [
  "张建国",
  "李秀兰",
  "赵德全",
  "刘桂芳",
  "周敏",
  "黄俊",
  "杨帆",
  "吴强",
  "郑梅",
  "孙磊",
  "唐蓉",
  "罗成",
  "蒋丽",
  "何伟",
]

async function main() {
  const [
    residentCount,
    doctorHealthProfileCount,
    userActionEventCount,
    intentInsightCount,
    serviceLeadCount,
    riskFocusItemCount,
  ] = await Promise.all([
    prisma.residentProfile.count(),
    prisma.doctorHealthProfile.count(),
    prisma.userActionEvent.count(),
    prisma.intentInsight.count(),
    prisma.serviceLead.count(),
    prisma.riskFocusItem.count(),
  ])

  const checks: Array<[string, boolean, string | number]> = [
    ["ResidentProfile >= 16", residentCount >= 16, residentCount],
    ["DoctorHealthProfile >= 16", doctorHealthProfileCount >= 16, doctorHealthProfileCount],
    ["UserActionEvent >= 80", userActionEventCount >= 80, userActionEventCount],
    ["IntentInsight >= 16", intentInsightCount >= 16, intentInsightCount],
    ["ServiceLead >= 16", serviceLeadCount >= 16, serviceLeadCount],
    ["RiskFocusItem >= 64", riskFocusItemCount >= 64, riskFocusItemCount],
  ]

  const residents = await prisma.residentProfile.findMany({
    where: { name: { in: requiredPatients } },
    select: { name: true },
  })
  const foundNames = new Set(residents.map((resident) => resident.name))
  const missingNames = requiredPatients.filter((name) => !foundNames.has(name))
  checks.push([
    "重点患者存在",
    missingNames.length === 0,
    missingNames.length === 0 ? "通过" : missingNames.join("、"),
  ])

  await checkZhangJianguo(checks)
  await checkLiXiulan(checks)
  await checkLiuGuifang(checks)
  await checkSunLei(checks)

  console.log("OPERATIONAL DEMO CHECK")
  console.log("======================")
  printChecks(checks)

  const failed = checks.some(([, passed]) => !passed)
  if (failed) {
    throw new Error("运营演示增强包检查未通过")
  }

  await printIntentAnalysis("张建国")
  await printIntentAnalysis("李秀兰")

  console.log("")
  console.log("演示路径:")
  console.log("- /gaoxin")
  console.log("- /gaoxin/health-record")
  console.log("- /doctor")
  console.log("- /doctor/service-leads")
  console.log("- /admin/intent-insights")
}

async function checkZhangJianguo(checks: Array<[string, boolean, string | number]>) {
  const resident = await loadResidentCase("张建国")
  checks.push(["张建国存在", !!resident, resident?.id ?? "未找到"])
  if (!resident) return

  checks.push([
    "张建国有胸闷胸痛相关 MedicalRecord",
    resident.medicalRecords.some((record) =>
      includesAny(recordText(record), ["胸闷", "胸痛", "心血管"])
    ),
    resident.medicalRecords.length,
  ])
  checks.push([
    "张建国有心电图或心血管相关 LabResult",
    resident.labResults.some((lab) =>
      includesAny(`${lab.itemName} ${lab.value} ${lab.abnormalFlag ?? ""}`, [
        "心电图",
        "ST-T",
        "肌钙",
        "心血管",
      ])
    ),
    resident.labResults.map((lab) => lab.itemName).join("、"),
  ])
  checks.push([
    "张建国有高血压相关 HealthTag",
    resident.healthTags.some((tag) => tag.name.includes("高血压")),
    resident.healthTags.map((tag) => tag.name).join("、"),
  ])
  checks.push([
    "张建国有心血管急性风险 RiskFocusItem",
    resident.doctorProfiles.some((profile) =>
      profile.riskFocusItems.some(
        (item) =>
          item.category === RiskFocusCategory.ACUTE_RISK &&
          includesAny(`${item.title} ${item.summary}`, ["心血管", "急性"])
      )
    ),
    resident.doctorProfiles.flatMap((profile) => profile.riskFocusItems).length,
  ])
  checks.push([
    "张建国有心血管专科就医 IntentInsight",
    resident.intentInsights.some(
      (insight) =>
        (insight.intentType === IntentType.ACUTE_CARE_INTENT ||
          insight.intentType === IntentType.SPECIALTY_CARE_INTENT) &&
        includesAny(`${insight.title} ${insight.summary} ${insight.evidenceEventsJson}`, [
          "心血管",
          "胸痛",
          "胸闷",
        ])
    ),
    resident.intentInsights.map((insight) => insight.intentType).join("、"),
  ])
  checks.push([
    "张建国有医院 ServiceLead",
    resident.serviceLeads.some((lead) => lead.receiverType === LeadReceiverType.HOSPITAL),
    resident.serviceLeads.map((lead) => `${lead.leadType}/${lead.receiverType}`).join("、"),
  ])
}

async function checkLiXiulan(checks: Array<[string, boolean, string | number]>) {
  const resident = await loadResidentCase("李秀兰")
  checks.push(["李秀兰存在", !!resident, resident?.id ?? "未找到"])
  if (!resident) return

  checks.push([
    "李秀兰有高血压慢病记录",
    resident.medicalRecords.some((record) => recordText(record).includes("高血压")),
    resident.medicalRecords.length,
  ])
  checks.push([
    "李秀兰有社区随访记录",
    resident.medicalRecords.some((record) =>
      includesAny(`${record.sourceType} ${record.institutionName} ${record.departmentName}`, [
        "community",
        "public_health",
        "社区",
        "随访",
      ])
    ),
    resident.medicalRecords.map((record) => record.institutionName).join("、"),
  ])
  checks.push([
    "李秀兰有社区 ServiceLead",
    resident.serviceLeads.some(
      (lead) => lead.receiverType === LeadReceiverType.COMMUNITY_HEALTH_CENTER
    ),
    resident.serviceLeads.map((lead) => `${lead.leadType}/${lead.receiverType}`).join("、"),
  ])
}

async function checkLiuGuifang(checks: Array<[string, boolean, string | number]>) {
  const resident = await loadResidentCase("刘桂芳")
  checks.push(["刘桂芳存在", !!resident, resident?.id ?? "未找到"])
  if (!resident) return

  checks.push([
    "刘桂芳有糖尿病记录",
    resident.medicalRecords.some((record) => recordText(record).includes("糖尿病")) ||
      resident.diagnoses.some((diagnosis) => diagnosis.name.includes("糖尿病")),
    resident.diagnoses.map((diagnosis) => diagnosis.name).join("、"),
  ])
  checks.push([
    "刘桂芳有糖化血红蛋白或尿微量白蛋白记录",
    resident.labResults.some((lab) =>
      includesAny(lab.itemName, ["糖化血红蛋白", "尿微量白蛋白"])
    ),
    resident.labResults.map((lab) => lab.itemName).join("、"),
  ])
  checks.push([
    "刘桂芳有糖尿病随访意图",
    resident.intentInsights.some((insight) =>
      includesAny(`${insight.title} ${insight.summary} ${insight.evidenceEventsJson}`, [
        "糖尿病",
        "血糖",
        "尿微量白蛋白",
      ])
    ),
    resident.intentInsights.map((insight) => insight.title).join("、"),
  ])
}

async function checkSunLei(checks: Array<[string, boolean, string | number]>) {
  const resident = await loadResidentCase("孙磊")
  checks.push(["孙磊存在", !!resident, resident?.id ?? "未找到"])
  if (!resident) return

  checks.push([
    "孙磊有青霉素过敏记录",
    resident.allergies.some((allergy) => allergy.allergen.includes("青霉素")),
    resident.allergies.map((allergy) => allergy.allergen).join("、"),
  ])
  checks.push([
    "孙磊有用药安全 RiskFocusItem",
    resident.doctorProfiles.some((profile) =>
      profile.riskFocusItems.some((item) =>
        includesAny(`${item.category} ${item.title} ${item.summary}`, [
          "MEDICATION_SAFETY",
          "用药",
          "抗生素",
          "青霉素",
        ])
      )
    ),
    resident.doctorProfiles.flatMap((profile) => profile.riskFocusItems).length,
  ])
  checks.push([
    "孙磊有抗生素相关 UserActionEvent",
    resident.userActionEvents.some((event) =>
      includesAny(`${event.eventName} ${event.content ?? ""} ${event.metadataJson}`, [
        "抗生素",
        "青霉素",
        "头孢",
      ])
    ),
    resident.userActionEvents.map((event) => event.eventName).join("、"),
  ])
}

async function loadResidentCase(name: string) {
  return prisma.residentProfile.findFirst({
    where: { name },
    include: {
      healthTags: true,
      medicalRecords: true,
      diagnoses: true,
      labResults: true,
      allergies: true,
      userActionEvents: true,
      intentInsights: true,
      serviceLeads: true,
      doctorProfiles: {
        include: {
          riskFocusItems: true,
        },
      },
    },
  })
}

async function printIntentAnalysis(name: string) {
  const resident = await prisma.residentProfile.findFirst({
    where: { name },
    select: { id: true, name: true },
  })
  assert(!!resident, `未找到居民：${name}`)

  const generated = await analyzeResidentIntent(resident.id)
  const [existingInsights, existingLeads] = await Promise.all([
    prisma.intentInsight.findMany({
      where: { residentId: resident.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.serviceLead.findMany({
      where: { residentId: resident.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  console.log("")
  console.log(`${name} 意图分析:`)
  console.log(`  本次新增 insight/lead: ${generated.insights.length}/${generated.leads.length}`)
  console.log(
    `  当前 insights: ${existingInsights.map((item) => `${item.intentType}/${item.priority}`).join("、")}`
  )
  console.log(
    `  当前 leads: ${existingLeads.map((item) => `${item.leadType}/${item.receiverType}/${item.status}`).join("、")}`
  )
}

function printChecks(checks: Array<[string, boolean, string | number]>) {
  for (const [label, passed, value] of checks) {
    console.log(`${passed ? "✓" : "✗"} ${label}: ${value}`)
  }
}

function recordText(record: {
  chiefComplaint: string
  diagnosisText: string
  treatmentText: string
  departmentName: string
}) {
  return `${record.chiefComplaint} ${record.diagnosisText} ${record.treatmentText} ${record.departmentName}`
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword))
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
