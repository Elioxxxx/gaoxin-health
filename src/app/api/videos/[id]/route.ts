import {
  ApiError,
  getRouteParams,
  handleApiError,
  ok,
  type RouteContext,
} from "@/lib/api/response"
import { getVideoWatchData } from "@/server/queries/video-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  try {
    const { id } = await getRouteParams(context)
    const data = await getVideoWatchData(id)

    if (!data) {
      throw new ApiError("not_found", "视频不存在或未发布", 404)
    }

    return ok(data)
  } catch (error) {
    return handleApiError(error, "video_load_failed", "视频加载失败")
  }
}
