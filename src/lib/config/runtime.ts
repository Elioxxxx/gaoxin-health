import { z } from "zod"

export const aiProviderSchema = z.enum([
  "mock",
  "openai",
  "openai-compatible",
  "doubao",
  "volcengine",
  "private",
])

export const appEnvironmentSchema = z.enum(["local", "demo", "sandbox", "staging", "production"])

export const medicalDataSourceSchema = z.enum(["mock", "integration-gateway"])

const runtimeConfigSchema = z.object({
  appEnv: appEnvironmentSchema.default("local"),
  appVersion: z.string().default("local"),
  nodeEnv: z.string().default("development"),
  databaseUrl: optionalEnvString(),
  aiProvider: aiProviderSchema.default("mock"),
  aiBaseUrl: optionalEnvString().pipe(z.string().url().optional()),
  aiApiKey: optionalEnvString(),
  aiModel: z.string().default("mock-medical-agent-v0.1"),
  aiTimeoutMs: z.coerce.number().int().positive().default(12_000),
  aiFallbackToMock: envBoolean(true),
  medicalDataSource: medicalDataSourceSchema.default("mock"),
})

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>

export type ReadinessSeverity = "ok" | "warning" | "blocking"

export type ReadinessCheck = {
  key: string
  severity: ReadinessSeverity
  message: string
}

export function getRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return runtimeConfigSchema.parse({
    appEnv: env.APP_ENV,
    appVersion: env.APP_VERSION,
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL,
    aiProvider: env.AI_PROVIDER,
    aiBaseUrl: env.AI_BASE_URL,
    aiApiKey: env.AI_API_KEY,
    aiModel: env.AI_MODEL,
    aiTimeoutMs: env.AI_TIMEOUT_MS,
    aiFallbackToMock: env.AI_FALLBACK_TO_MOCK,
    medicalDataSource: env.MEDICAL_DATA_SOURCE,
  })
}

function optionalEnvString() {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined
    }

    return value
  }, z.string().optional())
}

function envBoolean(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return defaultValue
    }

    if (typeof value === "string") {
      return ["1", "true", "yes", "on"].includes(value.toLowerCase())
    }

    return value
  }, z.boolean())
}

export function getProductionReadinessReport(config = getRuntimeConfig()) {
  const checks: ReadinessCheck[] = [
    {
      key: "ai-provider",
      severity: config.aiProvider === "mock" ? "warning" : "ok",
      message:
        config.aiProvider === "mock"
          ? "当前仍使用 Mock AI Provider，生产环境应切换到受治理的真实模型 Provider。"
          : `当前 AI Provider 为 ${config.aiProvider}。`,
    },
    {
      key: "ai-credentials",
      severity:
        config.aiProvider === "mock" || (config.aiBaseUrl && config.aiApiKey)
          ? "ok"
          : "blocking",
      message:
        config.aiProvider === "mock" || (config.aiBaseUrl && config.aiApiKey)
          ? "AI Provider 配置满足当前运行模式。"
          : "真实 AI Provider 需要配置 AI_BASE_URL 和 AI_API_KEY。",
    },
    {
      key: "medical-data-source",
      severity: config.medicalDataSource === "mock" ? "warning" : "ok",
      message:
        config.medicalDataSource === "mock"
          ? "当前仍使用 Mock/本地数据源，生产环境应通过 Integration Gateway 接入真实数据。"
          : "当前已配置 Integration Gateway 数据源。",
    },
    {
      key: "database",
      severity: !config.databaseUrl
        ? "blocking"
        : config.databaseUrl.startsWith("file:")
          ? "warning"
          : "ok",
      message: !config.databaseUrl
        ? "未配置 DATABASE_URL，服务无法稳定访问数据库。"
        : config.databaseUrl.startsWith("file:")
          ? "当前数据库为 SQLite 文件，生产环境建议迁移到 PostgreSQL/MySQL。"
          : "数据库配置不再是本地 SQLite 文件。",
    },
  ]

  return {
    config: {
      appEnv: config.appEnv,
      appVersion: config.appVersion,
      aiProvider: config.aiProvider,
      aiModel: config.aiModel,
      medicalDataSource: config.medicalDataSource,
      databaseKind: !config.databaseUrl
        ? "not-configured"
        : config.databaseUrl.startsWith("file:")
          ? "sqlite-file"
          : "external-db",
      aiApiKeyConfigured: Boolean(config.aiApiKey),
    },
    checks,
    hasBlockingIssue: checks.some((check) => check.severity === "blocking"),
  }
}
