import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const sessions = await prisma.preConsultSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      resident: true,
      report: true,
      triageResult: true,
      recommendations: {
        orderBy: { rank: "asc" },
        include: { institution: true, department: true, doctor: true },
      },
    },
  })

  const priority: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }
  const sorted = [...sessions].sort(
    (a, b) =>
      (priority[a.triageResult?.level ?? "P4"] ?? 9) -
      (priority[b.triageResult?.level ?? "P4"] ?? 9)
  )

  return ok(sorted)
}
