import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    orderBy: [{ isExpert: "desc" }, { name: "asc" }],
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })

  return ok(doctors)
}
