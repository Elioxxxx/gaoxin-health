import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  ApiError,
  getRequestContextMeta,
  handleApiError,
  ok,
} from "@/lib/api/response"
import { getAuthContext } from "@/lib/security/auth-context"
import { requirePermission } from "@/lib/security/authorization"
import { safeAuditLog } from "@/lib/security/audit"

export const runtime = "nodejs"

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024
const MAX_COVER_SIZE_BYTES = 8 * 1024 * 1024
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads")

export async function POST(request: Request) {
  const requestMeta = getRequestContextMeta(request)
  const auth = getAuthContext(request)

  try {
    requirePermission(auth, "admin:manage")
    const formData = await request.formData()
    const video = formData.get("video")
    const cover = formData.get("cover")

    if (!(video instanceof File)) {
      throw new ApiError("invalid_video_file", "请选择要上传的 mp4 视频文件", 422)
    }

    if (!(cover instanceof File)) {
      throw new ApiError("invalid_cover_file", "请先选择视频首帧或尾帧生成封面", 422)
    }

    validateVideoFile(video)
    validateCoverFile(cover)

    const uploadId = crypto.randomUUID()
    const videoDirectory = path.join(UPLOAD_ROOT, "videos")
    const coverDirectory = path.join(UPLOAD_ROOT, "video-covers")
    const videoFileName = `${uploadId}.mp4`
    const coverFileName = `${uploadId}.jpg`

    await Promise.all([mkdir(videoDirectory, { recursive: true }), mkdir(coverDirectory, { recursive: true })])
    await Promise.all([
      writeFile(path.join(videoDirectory, videoFileName), Buffer.from(await video.arrayBuffer())),
      writeFile(path.join(coverDirectory, coverFileName), Buffer.from(await cover.arrayBuffer())),
    ])

    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "UPLOAD_VIDEO_FILE",
      resourceType: "VideoContent",
      result: "SUCCESS",
      metadata: {
        uploadId,
        originalName: video.name,
        size: video.size,
      },
    })

    return ok({
      uploadPath: `/uploads/videos/${videoFileName}`,
      coverImageUrl: `/uploads/video-covers/${coverFileName}`,
    })
  } catch (error) {
    await safeAuditLog({
      auth,
      request: requestMeta,
      purpose: "ADMIN_VIDEO_MANAGEMENT",
      action: "UPLOAD_VIDEO_FILE",
      resourceType: "VideoContent",
      result: "FAILED",
      metadata: { message: error instanceof Error ? error.message : "unknown" },
    })

    return handleApiError(error, "video_upload_failed", "视频上传失败")
  }
}

function validateVideoFile(file: File) {
  const extension = path.extname(file.name).toLowerCase()

  if (file.size <= 0 || file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new ApiError("video_file_too_large", "视频文件大小需在 200MB 以内", 422)
  }

  if (file.type !== "video/mp4" || extension !== ".mp4") {
    throw new ApiError("unsupported_video_type", "当前仅支持上传 mp4 视频", 422)
  }
}

function validateCoverFile(file: File) {
  if (file.size <= 0 || file.size > MAX_COVER_SIZE_BYTES) {
    throw new ApiError("cover_file_too_large", "封面文件大小需在 8MB 以内", 422)
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new ApiError("unsupported_cover_type", "封面生成失败，请重新选择视频帧", 422)
  }
}
