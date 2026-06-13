import { fail, ok } from "@/lib/api/response"
import { getDefaultResident } from "@/server/queries/resident-query"

export async function GET() {
  const resident = await getDefaultResident()

  if (!resident) {
    return fail("not_found", "未找到 Mock 居民", 404)
  }

  return ok(resident)
}
