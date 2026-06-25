import {
  VideoCommentStatus,
  VideoInteractionType,
  VideoPlaybackEventType,
  type Prisma,
} from "@/generated/prisma/client"
import { ApiError } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"
import { getDefaultResident } from "@/server/queries/resident-query"

export async function toggleVideoInteraction(videoId: string, type: VideoInteractionType) {
  const residentId = await getDefaultResidentId()
  const countField = type === VideoInteractionType.LIKE ? "likeCount" : "favoriteCount"

  return prisma.$transaction(async (tx) => {
    await ensureVideoExists(tx, videoId)
    const existing = await tx.videoInteraction.findUnique({
      where: {
        videoId_residentId_type: {
          videoId,
          residentId,
          type,
        },
      },
    })
    const nextActive = !(existing?.active ?? false)

    if (existing) {
      await tx.videoInteraction.update({
        where: { id: existing.id },
        data: { active: nextActive },
      })
    } else {
      await tx.videoInteraction.create({
        data: {
          videoId,
          residentId,
          type,
          active: true,
        },
      })
    }

    const activeCount = await tx.videoInteraction.count({
      where: { videoId, type, active: true },
    })
    const video = await tx.videoContent.update({
      where: { id: videoId },
      data: { [countField]: activeCount },
    })

    return {
      active: nextActive,
      likeCount: video.likeCount,
      favoriteCount: video.favoriteCount,
    }
  })
}

export async function recordVideoPlaybackEvent(input: {
  videoId: string
  eventType: VideoPlaybackEventType
  progressSeconds?: number
  playbackRate?: number
  metadata?: Record<string, unknown>
}) {
  const residentId = await getDefaultResidentId()

  return prisma.$transaction(async (tx) => {
    await ensureVideoExists(tx, input.videoId)
    const event = await tx.videoPlaybackEvent.create({
      data: {
        videoId: input.videoId,
        residentId,
        eventType: input.eventType,
        progressSeconds: input.progressSeconds,
        playbackRate: input.playbackRate,
        metadataJson: stringifyJson(input.metadata ?? {}),
      },
    })

    if (input.eventType === VideoPlaybackEventType.PLAY) {
      await tx.videoContent.update({
        where: { id: input.videoId },
        data: { viewCount: { increment: 1 } },
      })
    }

    if (input.eventType === VideoPlaybackEventType.COMPLETE) {
      await tx.videoContent.update({
        where: { id: input.videoId },
        data: { completionCount: { increment: 1 } },
      })
    }

    if (
      input.eventType === VideoPlaybackEventType.IMPRESSION ||
      input.eventType === VideoPlaybackEventType.CLICK
    ) {
      await tx.videoRecommendationLog.create({
        data: {
          videoId: input.videoId,
          residentId,
          eventName: input.eventType,
          pagePath: typeof input.metadata?.pagePath === "string" ? input.metadata.pagePath : undefined,
          matchedTags: stringifyJson(input.metadata?.matchedTags ?? []),
          score: typeof input.metadata?.score === "number" ? input.metadata.score : 0,
        },
      })
    }

    return event
  })
}

export async function createVideoComment(videoId: string, content: string) {
  const residentId = await getDefaultResidentId()

  return prisma.$transaction(async (tx) => {
    await ensureVideoExists(tx, videoId)

    return tx.videoComment.create({
      data: {
        videoId,
        residentId,
        content,
        status: VideoCommentStatus.PENDING,
      },
    })
  })
}

export async function reviewVideoComment(input: {
  commentId: string
  status: VideoCommentStatus
  reviewerName?: string
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.videoComment
      .findUnique({ where: { id: input.commentId } })
      .then((comment) => comment ?? Promise.reject(new ApiError("not_found", "留言不存在", 404)))

    const comment = await tx.videoComment.update({
      where: { id: input.commentId },
      data: {
        status: input.status,
        reviewerName: input.reviewerName ?? "卫健端运营",
        reviewedAt: new Date(),
      },
    })

    if (existing.status !== input.status) {
      const approvedCount = await tx.videoComment.count({
        where: {
          videoId: comment.videoId,
          status: VideoCommentStatus.APPROVED,
        },
      })
      await tx.videoContent.update({
        where: { id: comment.videoId },
        data: { commentCount: approvedCount },
      })
    }

    return comment
  })
}

async function ensureVideoExists(tx: Prisma.TransactionClient, videoId: string) {
  const video = await tx.videoContent.findUnique({
    where: { id: videoId },
    select: { id: true },
  })

  if (!video) {
    throw new ApiError("not_found", "视频不存在", 404)
  }
}

async function getDefaultResidentId() {
  const resident = await getDefaultResident()

  if (!resident) {
    throw new ApiError("resident_not_found", "未找到居民信息", 404)
  }

  return resident.id
}
