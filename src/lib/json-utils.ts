export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback
  }

  if (typeof value !== "string") {
    return value as T
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function toJsonString(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  return JSON.stringify(value)
}

export function normalizeJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    return safeJsonParse<T>(value, fallback)
  }

  if (value === null || value === undefined) {
    return fallback
  }

  return value as T
}
