import { ok } from "@/lib/api/response"
import { getHomeVideoRecommendations } from "@/server/queries/video-query"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get("limit") ?? 3)

  return ok({
    videos: await getHomeVideoRecommendations(Number.isFinite(limit) ? limit : 3),
  })
}
