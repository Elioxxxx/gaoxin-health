import { NextResponse } from "next/server"
import { z } from "zod"

export type RouteContext<T extends Record<string, string> = Record<string, string>> = {
  params: T | Promise<T>
}

export async function getRouteParams<T extends Record<string, string>>(
  context: RouteContext<T>
) {
  return context.params instanceof Promise ? await context.params : context.params
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init)
}

export function created<T>(data: T) {
  return ok(data, { status: 201 })
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status })
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown, fallbackCode: string, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    )
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: "请求参数校验失败",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        },
      },
      { status: 422 }
    )
  }

  console.error(fallbackCode, error)

  return fail(fallbackCode, fallbackMessage, 500)
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    return {} as T
  }
}

export async function parseJsonBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  return schema.parse(await readJson<unknown>(request))
}

export type RequestContextMeta = {
  requestId: string
  traceId: string
  ipAddress?: string
  userAgent?: string
}

export function getRequestContextMeta(request: Request): RequestContextMeta {
  return {
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
    traceId: request.headers.get("x-trace-id") ?? crypto.randomUUID(),
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  }
}
