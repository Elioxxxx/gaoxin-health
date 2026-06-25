import {
  ApiError,
  getRequestContextMeta,
  getRouteParams,
  handleApiError,
  ok,
  parseJsonBody,
  type RouteContext,
} from "@/lib/api/response"
import { videoContentUpdateSchema } from "@/lib/api/schemas"
import { prisma } from "@/lib/db/prisma"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { stringifyJson } from "@/lib/json"
import { normalizeTags, parseDate, tagConnectOrCreate } from "@/server/mutations/admin-video-mutation"

export async function PUT(request: Request, context: RouteContext<{ id: string }>) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)
  const { id } = await getRouteParams(context)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, videoContentUpdateSchema)
    const data = {
      title: body.title,
      summary: body.summary,
      description: body.description,
      sourceName: body.sourceName,
      sourceType: body.sourceType,
      videoUrl: body.videoUrl,
      uploadPath: body.uploadPath,
      coverImageUrl: body.coverImageUrl,
      durationSeconds: body.durationSeconds,
      orientation: body.orientation,
      status: body.status,
      audienceTags:
        body.audienceTags === undefined ? undefined : stringifyJson(normalizeTags(body.audienceTags)),
      audienceMatchMode: body.audienceMatchMode,
      isHomeRecommended: body.isHomeRecommended,
      isPinned: body.isPinned,
      priority: body.priority,
      publishedAt: parseDate(body.publishedAt),
      publishStartAt: parseDate(body.publishStartAt),
      publishEndAt: parseDate(body.publishEndAt),
      tags:
        body.tags === undefined
          ? undefined
          : {
              set: [],
              ...tagConnectOrCreate(body.tags),
            },
    }
    const video = await prisma.videoContent
      .update({
        where: { id },
        data,
        include: { tags: true },
      })
      .catch(() => {
        throw new ApiError("not_found", "视频不存在", 404)
      })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "UPDATE_VIDEO",
      resourceType: "VideoContent",
      resourceId: id,
      result: "SUCCESS",
      metadata: { changedFields: Object.keys(body) },
    })

    return ok(video)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "UPDATE_VIDEO",
      resourceType: "VideoContent",
      resourceId: id,
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_update_failed", "视频更新失败")
  }
}
