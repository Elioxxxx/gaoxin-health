import {
  created,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { videoPlaybackEventSchema } from "@/lib/api/schemas"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { recordVideoPlaybackEvent } from "@/server/mutations/video-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "intent:write")
    const body = await parseJsonBody(request, videoPlaybackEventSchema)
    const event = await recordVideoPlaybackEvent({
      videoId: id,
      eventType: body.eventType,
      progressSeconds: body.progressSeconds,
      playbackRate: body.playbackRate,
      metadata: body.metadata,
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "VIDEO_RECOMMENDATION",
      action: "LOG_VIDEO_EVENT",
      resourceType: "VideoContent",
      resourceId: id,
      result: "SUCCESS",
      metadata: { eventType: body.eventType },
    })

    return created({ event })
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "VIDEO_RECOMMENDATION",
      action: "LOG_VIDEO_EVENT",
      resourceType: "VideoContent",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_event_failed", "视频行为记录失败")
  }
}
