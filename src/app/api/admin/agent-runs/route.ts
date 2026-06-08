import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const runs = await prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      steps: true,
      session: {
        include: {
          resident: true,
          triageResult: true,
        },
      },
    },
  })

  return ok(runs)
}
