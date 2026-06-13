import "dotenv/config"

import { getProductionReadinessReport, getRuntimeConfig } from "@/lib/config/runtime"

const strict = process.argv.includes("--strict")
const report = getProductionReadinessReport(getRuntimeConfig())

console.log("PRODUCTION READINESS")
console.log("====================")
console.log(`appEnv: ${report.config.appEnv}`)
console.log(`appVersion: ${report.config.appVersion}`)
console.log(`aiProvider: ${report.config.aiProvider}`)
console.log(`aiModel: ${report.config.aiModel}`)
console.log(`medicalDataSource: ${report.config.medicalDataSource}`)
console.log(`databaseKind: ${report.config.databaseKind}`)
console.log(`aiApiKeyConfigured: ${report.config.aiApiKeyConfigured ? "yes" : "no"}`)
console.log("")

for (const check of report.checks) {
  console.log(`[${check.severity.toUpperCase()}] ${check.key}`)
  console.log(`  ${check.message}`)
}

if (strict && report.hasBlockingIssue) {
  process.exitCode = 1
}
