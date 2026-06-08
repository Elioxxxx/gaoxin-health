import { NextResponse } from "next/server"

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

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    return {} as T
  }
}
