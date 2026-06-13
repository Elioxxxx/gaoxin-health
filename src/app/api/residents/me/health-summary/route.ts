import { fail, ok } from "@/lib/api/response"
import { getDefaultResidentHealthSummary } from "@/server/queries/resident-query"

export async function GET() {
  const data = await getDefaultResidentHealthSummary()

  if (!data) {
    return fail("not_found", "未找到 Mock 居民", 404)
  }

  return ok(data)
}
