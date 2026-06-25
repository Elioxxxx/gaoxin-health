import {
  VideoAudienceMatchMode,
  VideoOrientation,
  VideoPublishStatus,
  VideoSourceType,
  type Prisma,
} from "@/generated/prisma/client"
import { stringifyJson } from "@/lib/json"

export function toVideoCreateData(body: {
  title: string
  summary: string
  description?: string
  sourceName?: string
  sourceType?: VideoSourceType
  videoUrl?: string
  uploadPath?: string
  coverImageUrl?: string
  durationSeconds: number
  orientation?: VideoOrientation
  status?: VideoPublishStatus
  audienceTags?: unknown
  audienceMatchMode?: VideoAudienceMatchMode
  isHomeRecommended?: boolean
  isPinned?: boolean
  priority?: number
  publishedAt?: string
  publishStartAt?: string
  publishEndAt?: string
}): Prisma.VideoContentCreateInput {
  return {
    title: body.title,
    summary: body.summary,
    description: body.description ?? body.summary,
    sourceName: body.sourceName ?? "高新区卫健局",
    sourceType: body.sourceType ?? VideoSourceType.EXTERNAL_URL,
    videoUrl: body.videoUrl,
    uploadPath: body.uploadPath,
    coverImageUrl: body.coverImageUrl,
    durationSeconds: body.durationSeconds,
    orientation: body.orientation ?? VideoOrientation.AUTO,
    status: body.status ?? VideoPublishStatus.PENDING_REVIEW,
    audienceTags: stringifyJson(normalizeTags(body.audienceTags)),
    audienceMatchMode: body.audienceMatchMode ?? VideoAudienceMatchMode.NONE,
    isHomeRecommended: body.isHomeRecommended ?? true,
    isPinned: body.isPinned ?? false,
    priority: body.priority ?? 50,
    publishedAt: parseDate(body.publishedAt) ?? new Date(),
    publishStartAt: parseDate(body.publishStartAt),
    publishEndAt: parseDate(body.publishEndAt),
  }
}

export function tagConnectOrCreate(tags: unknown): Prisma.VideoTagCreateNestedManyWithoutVideosInput {
  return {
    connectOrCreate: normalizeTags(tags).map((name) => ({
      where: { name },
      create: {
        name,
        category: "健康科普",
        color: "emerald",
      },
    })),
  }
}

export function normalizeTags(tags: unknown) {
  const values = Array.isArray(tags) ? tags : []

  return Array.from(new Set(values.map(String).map((tag) => tag.trim()).filter(Boolean)))
}

export function parseDate(value?: string) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}
