import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const issues = await prisma.qualityIssue.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      session: { include: { resident: true } },
      feedback: true,
    },
  })

  return ok(issues)
}
