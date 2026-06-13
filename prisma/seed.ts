import { seedDepartments } from "./seed/departments"
import { seedDoctors } from "./seed/doctors"
import { seedInstitutions } from "./seed/institutions"
import { seedOperationalDemoData } from "./seed/operational-demo"
import { seedSessions } from "./seed/pre-consult-demo"
import { resetDatabase } from "./seed/reset"
import { seedResidents, seedResidentHealthData } from "./seed/residents"
import { seedRulesAndKnowledge } from "./seed/rules-knowledge"
import { prisma } from "./seed/shared"

async function main() {
  await resetDatabase()
  const institutions = await seedInstitutions()
  const departments = await seedDepartments(institutions)
  const doctors = await seedDoctors(institutions, departments)
  const residents = await seedResidents()
  await seedResidentHealthData(residents)
  await seedOperationalDemoData(residents, institutions, departments)
  await seedRulesAndKnowledge()
  await seedSessions(residents, institutions, departments, doctors)

  console.log("Seed 完成：已写入高新区 Mock 医疗资源、居民健康档案、规则、知识库与 Agent 日志。")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
