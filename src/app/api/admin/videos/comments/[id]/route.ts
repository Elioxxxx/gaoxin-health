import {
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  ok,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { videoCommentReviewSchema } from "@/lib/api/schemas"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { reviewVideoComment } from "@/server/mutations/video-mutation"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, videoCommentReviewSchema)
    const comment = await reviewVideoComment({
      commentId: id,
      status: body.status,
      reviewerName: body.reviewerName,
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "REVIEW_VIDEO_COMMENT",
      resourceType: "VideoComment",
      resourceId: id,
      result: "SUCCESS",
      metadata: { status: comment.status },
    })

    return ok(comment)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "REVIEW_VIDEO_COMMENT",
      resourceType: "VideoComment",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_comment_review_failed", "留言审核失败")
  }
}
