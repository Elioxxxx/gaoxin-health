import { NextResponse } from "next/server"

import { prisma } from "@/lib/db/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const startedAt = Date.now()

  try {
    await prisma.$queryRawUnsafe("SELECT 1")

    return NextResponse.json(
      {
        status: "ok",
        service: "gaoxin-health",
        appEnv: process.env.APP_ENV ?? process.env.NODE_ENV ?? "unknown",
        version: process.env.APP_VERSION ?? "local",
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: {
            status: "ok",
            latencyMs: Date.now() - startedAt,
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "gaoxin-health",
        checks: {
          database: {
            status: "error",
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  }
}
