import {
  created,
  getRequestContextMeta,
  handleApiError,
  ok,
  parseJsonBody,
} from "@/lib/api/response"
import { videoContentCreateSchema } from "@/lib/api/schemas"
import { prisma } from "@/lib/db/prisma"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"
import { tagConnectOrCreate, toVideoCreateData } from "@/server/mutations/admin-video-mutation"
import { getAdminVideoDashboard } from "@/server/queries/video-query"

export async function GET() {
  return ok(await getAdminVideoDashboard())
}

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const body = await parseJsonBody(request, videoContentCreateSchema)
    const video = await prisma.videoContent.create({
      data: {
        ...toVideoCreateData(body),
        tags: tagConnectOrCreate(body.tags),
      },
      include: { tags: true },
    })

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "CREATE_VIDEO",
      resourceType: "VideoContent",
      resourceId: video.id,
      result: "SUCCESS",
      metadata: { title: video.title },
    })

    return created(video)
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "CREATE_VIDEO",
      resourceType: "VideoContent",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_create_failed", "视频创建失败")
  }
}
