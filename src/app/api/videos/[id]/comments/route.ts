import {
  created,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { videoCommentCreateSchema } from "@/lib/api/schemas"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { createVideoComment } from "@/server/mutations/video-mutation"

export async function POST(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "intent:write")
    const body = await parseJsonBody(request, videoCommentCreateSchema)
    const comment = await createVideoComment(id, body.content)

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "VIDEO_RECOMMENDATION",
      action: "CREATE_VIDEO_COMMENT",
      resourceType: "VideoContent",
      resourceId: id,
      result: "SUCCESS",
      metadata: { commentId: comment.id, status: comment.status },
    })

    return created({ comment })
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "VIDEO_RECOMMENDATION",
      action: "CREATE_VIDEO_COMMENT",
      resourceType: "VideoContent",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_comment_failed", "留言提交失败")
  }
}
