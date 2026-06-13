import "dotenv/config"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

import { PrismaClient } from "../../src/generated/prisma/client"

export {
  AgentRunStatus,
  IntentType,
  InstitutionType,
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
  MessageRole,
  Role,
  RiskFocusCategory,
  SessionStatus,
  TriageLevel,
  UserActionEventType,
} from "../../src/generated/prisma/client"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})

export const prisma = new PrismaClient({ adapter })

export const json = (value: unknown) => JSON.stringify(value, null, 2)
export const date = (value: string) => new Date(`${value}T00:00:00.000Z`)

export function mustGet<T>(map: Map<string, T>, key: string): T {
  const value = map.get(key)

  if (!value) {
    throw new Error(`Seed 数据缺失：${key}`)
  }

  return value
}
