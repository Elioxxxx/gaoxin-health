import {
  created,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { videoInteractionSchema } from "@/lib/api/schemas"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { toggleVideoInteraction } from "@/server/mutations/video-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "intent:write")
    const body = await parseJsonBody(request, videoInteractionSchema)
    const interaction = await toggleVideoInteraction(id, body.type)

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "VIDEO_RECOMMENDATION",
      action: "TOGGLE_VIDEO_INTERACTION",
      resourceType: "VideoContent",
      resourceId: id,
      result: "SUCCESS",
      metadata: { type: body.type, active: interaction.active },
    })

    return created({ interaction })
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "VIDEO_RECOMMENDATION",
      action: "TOGGLE_VIDEO_INTERACTION",
      resourceType: "VideoContent",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_interaction_failed", "视频互动失败")
  }
}
