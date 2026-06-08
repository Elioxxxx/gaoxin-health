import { fail, ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const resident = await prisma.residentProfile.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      user: true,
      healthTags: true,
    },
  })

  if (!resident) {
    return fail("not_found", "未找到 Mock 居民", 404)
  }

  return ok(resident)
}
