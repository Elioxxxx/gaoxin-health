import { fail, ok, readJson } from "@/lib/api/response"
import { analyzeResidentIntent } from "@/lib/intent/intent-engine"

export async function POST(request: Request) {
  try {
    const body = await readJson<{ residentId?: string }>(request)

    if (!body.residentId) {
      return fail("validation_error", "缺少居民 ID", 422)
    }

    return ok(await analyzeResidentIntent(body.residentId))
  } catch (error) {
    return fail("intent_analyze_failed", error instanceof Error ? error.message : "意图分析失败", 500)
  }
}
