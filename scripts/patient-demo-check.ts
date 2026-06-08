import "dotenv/config"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const [
    residentCount,
    doctorHealthProfileCount,
    userActionEventCount,
    intentInsightCount,
    serviceLeadCount,
    residents,
    zhangJianguo,
  ] = await Promise.all([
    prisma.residentProfile.count(),
    prisma.doctorHealthProfile.count(),
    prisma.userActionEvent.count(),
    prisma.intentInsight.count(),
    prisma.serviceLead.count(),
    prisma.residentProfile.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            medicalRecords: true,
            labResults: true,
          },
        },
      },
    }),
    prisma.residentProfile.findFirst({
      where: { name: "张建国" },
      select: {
        id: true,
        doctorProfiles: {
          select: {
            _count: {
              select: {
                riskFocusItems: true,
              },
            },
          },
        },
      },
    }),
  ])

  const residentsWithoutEnoughRecords = residents.filter(
    (resident) => resident._count.medicalRecords < 4
  )
  const residentsWithoutEnoughLabs = residents.filter(
    (resident) => resident._count.labResults < 4
  )
  const zhangRiskFocusCount =
    zhangJianguo?.doctorProfiles.reduce(
      (total, profile) => total + profile._count.riskFocusItems,
      0
    ) ?? 0

  const checks = [
    ["ResidentProfile 数量 >= 16", residentCount >= 16, residentCount],
    ["DoctorHealthProfile 数量 >= 16", doctorHealthProfileCount >= 16, doctorHealthProfileCount],
    ["UserActionEvent 数量 >= 80", userActionEventCount >= 80, userActionEventCount],
    ["IntentInsight 数量 >= 16", intentInsightCount >= 16, intentInsightCount],
    ["ServiceLead 数量 >= 16", serviceLeadCount >= 16, serviceLeadCount],
    ["每个患者至少 4 条 MedicalRecord", residentsWithoutEnoughRecords.length === 0, residentsWithoutEnoughRecords.map((item) => item.name).join("、") || "通过"],
    ["每个患者至少 4 条 LabResult", residentsWithoutEnoughLabs.length === 0, residentsWithoutEnoughLabs.map((item) => item.name).join("、") || "通过"],
    ["张建国 RiskFocusItem >= 6", zhangRiskFocusCount >= 6, zhangRiskFocusCount],
  ] as const

  console.log("PATIENT DEMO CHECK")
  console.log("==================")

  let failed = false
  for (const [label, passed, value] of checks) {
    console.log(`${passed ? "✓" : "✗"} ${label}: ${value}`)
    failed ||= !passed
  }

  if (failed) {
    throw new Error("患者运营演示数据检查未通过")
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
