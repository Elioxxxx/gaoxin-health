import {
  VideoCommentStatus,
  VideoInteractionType,
  VideoPlaybackEventType,
  VideoPublishStatus,
  type VideoContent,
  type VideoTag,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { parseJsonArray } from "@/lib/json"
import {
  isVideoVisible,
  rankVideoRecommendations,
  type VideoRecommendationCandidate,
} from "@/lib/videos/recommendation"
import { getDefaultResident } from "@/server/queries/resident-query"

export type VideoCardDto = {
  id: string
  title: string
  summary: string
  description: string
  sourceName: string
  sourceType: string
  videoUrl: string
  uploadPath: string
  coverImageUrl: string
  durationSeconds: number
  durationText: string
  orientation: string
  tags: string[]
  matchedTags: string[]
  audienceTags: string[]
  audienceMatchMode: string
  likeCount: number
  favoriteCount: number
  commentCount: number
  viewCount: number
  isLiked: boolean
  isFavorited: boolean
}

type VideoWithTags = VideoContent & { tags: VideoTag[] }

export async function getHomeVideoRecommendations(limit = 3) {
  const resident = await getDefaultResident()
  const videos = await getPublishedVideoCandidates({ homeOnly: true })

  if (!resident) {
    return []
  }

  const residentTags = resident.healthTags.map((tag) => tag.name)
  const viewedVideoIds = await getViewedVideoIds(resident.id)
  const ranked = rankVideoRecommendations({
    videos: videos.map(toRecommendationCandidate),
    residentTags,
    viewedVideoIds,
    limit,
  })
  const states = await getInteractionStates(
    resident.id,
    ranked.map((item) => item.video.id)
  )

  return ranked.map((item) =>
    toVideoCardDto(item.video.source, {
      matchedTags: item.matchedTags,
      likedIds: states.likedIds,
      favoritedIds: states.favoritedIds,
    })
  )
}

export async function getVideoWatchData(videoId: string) {
  const resident = await getDefaultResident()

  if (!resident) {
    return null
  }

  const [activeVideo, recommendedVideos] = await Promise.all([
    prisma.videoContent.findFirst({
      where: {
        id: videoId,
        status: VideoPublishStatus.PUBLISHED,
      },
      include: { tags: true },
    }),
    getHomeVideoRecommendations(8),
  ])

  if (!activeVideo || !isWithinPublishWindow(activeVideo, new Date())) {
    return null
  }
  const residentTags = resident.healthTags.map((tag) => tag.name)
  const residentTagSet = new Set(residentTags.map((tag) => tag.trim().toLowerCase()))

  if (!isVideoVisible(toRecommendationCandidate(activeVideo), new Date(), residentTagSet)) {
    return null
  }

  const queueMap = new Map<string, VideoCardDto>()
  const activeCard = toVideoCardDto(activeVideo, { matchedTags: activeVideo.tags.map((tag) => tag.name) })
  queueMap.set(activeCard.id, activeCard)
  for (const video of recommendedVideos) {
    queueMap.set(video.id, video)
  }

  const queue = Array.from(queueMap.values())
  const states = await getInteractionStates(
    resident.id,
    queue.map((item) => item.id)
  )
  const comments = await prisma.videoComment.findMany({
    where: {
      videoId,
      status: VideoCommentStatus.APPROVED,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      resident: { select: { name: true } },
    },
  })

  return {
    residentId: resident.id,
    activeVideo: toVideoCardDto(activeVideo, {
      matchedTags: activeVideo.tags.map((tag) => tag.name),
      likedIds: states.likedIds,
      favoritedIds: states.favoritedIds,
    }),
    queue: queue.map((item) => ({
      ...item,
      isLiked: states.likedIds.has(item.id),
      isFavorited: states.favoritedIds.has(item.id),
    })),
    comments: comments.map((comment) => ({
      id: comment.id,
      authorName: maskResidentName(comment.resident.name),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    })),
  }
}

export async function getAdminVideoDashboard() {
  const [videos, pendingComments, healthTags] = await Promise.all([
    prisma.videoContent.findMany({
      orderBy: [{ isPinned: "desc" }, { priority: "desc" }, { updatedAt: "desc" }],
      include: {
        tags: true,
        comments: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { resident: { select: { name: true } } },
        },
      },
    }),
    prisma.videoComment.findMany({
      where: { status: VideoCommentStatus.PENDING },
      orderBy: { createdAt: "desc" },
      include: {
        video: { select: { title: true } },
        resident: { select: { name: true } },
      },
    }),
    prisma.healthTag.findMany({
      select: { name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ])
  const availableAudienceTags = Array.from(
    new Map(healthTags.map((tag) => [tag.name, tag])).values()
  ).map((tag) => ({
    name: tag.name,
    category: tag.category,
  }))

  return {
    videos: videos.map((video) => ({
      ...video,
      tagNames: video.tags.map((tag) => tag.name),
      audienceTagNames: parseJsonArray(video.audienceTags),
    })),
    availableAudienceTags,
    pendingComments: pendingComments.map((comment) => ({
      id: comment.id,
      videoId: comment.videoId,
      videoTitle: comment.video.title,
      residentName: comment.resident.name,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt.toISOString(),
    })),
  }
}

async function getPublishedVideoCandidates({ homeOnly }: { homeOnly: boolean }) {
  const now = new Date()

  return prisma.videoContent.findMany({
    where: {
      status: VideoPublishStatus.PUBLISHED,
      isHomeRecommended: homeOnly ? true : undefined,
      OR: [{ publishStartAt: null }, { publishStartAt: { lte: now } }],
      AND: [{ OR: [{ publishEndAt: null }, { publishEndAt: { gte: now } }] }],
    },
    include: { tags: true },
  })
}

function toRecommendationCandidate(video: VideoWithTags): VideoRecommendationCandidate & { source: VideoWithTags } {
  return {
    id: video.id,
    title: video.title,
    tags: video.tags.map((tag) => tag.name),
    audienceTags: parseJsonArray(video.audienceTags),
    audienceMatchMode: video.audienceMatchMode,
    status: video.status,
    isPinned: video.isPinned,
    priority: video.priority,
    publishedAt: video.publishedAt,
    publishStartAt: video.publishStartAt,
    publishEndAt: video.publishEndAt,
    source: video,
  }
}

async function getViewedVideoIds(residentId: string) {
  const events = await prisma.videoPlaybackEvent.findMany({
    where: {
      residentId,
      eventType: { in: [VideoPlaybackEventType.PLAY, VideoPlaybackEventType.COMPLETE] },
    },
    select: { videoId: true },
    distinct: ["videoId"],
  })

  return events.map((event) => event.videoId)
}

async function getInteractionStates(residentId: string, videoIds: string[]) {
  if (videoIds.length === 0) {
    return { likedIds: new Set<string>(), favoritedIds: new Set<string>() }
  }

  const interactions = await prisma.videoInteraction.findMany({
    where: {
      residentId,
      videoId: { in: videoIds },
      active: true,
      type: { in: [VideoInteractionType.LIKE, VideoInteractionType.FAVORITE] },
    },
  })

  return {
    likedIds: new Set(
      interactions
        .filter((interaction) => interaction.type === VideoInteractionType.LIKE)
        .map((interaction) => interaction.videoId)
    ),
    favoritedIds: new Set(
      interactions
        .filter((interaction) => interaction.type === VideoInteractionType.FAVORITE)
        .map((interaction) => interaction.videoId)
    ),
  }
}

function toVideoCardDto(
  video: VideoWithTags,
  options: {
    matchedTags?: string[]
    likedIds?: Set<string>
    favoritedIds?: Set<string>
  } = {}
): VideoCardDto {
  const videoUrl = video.sourceType === "UPLOAD" ? video.uploadPath : video.videoUrl

  return {
    id: video.id,
    title: video.title,
    summary: video.summary,
    description: video.description,
    sourceName: video.sourceName,
    sourceType: video.sourceType,
    videoUrl: videoUrl ?? "",
    uploadPath: video.uploadPath ?? "",
    coverImageUrl: video.coverImageUrl ?? "",
    durationSeconds: video.durationSeconds,
    durationText: formatDuration(video.durationSeconds),
    orientation: video.orientation,
    tags: video.tags.map((tag) => tag.name),
    audienceTags: parseJsonArray(video.audienceTags),
    audienceMatchMode: video.audienceMatchMode,
    matchedTags: options.matchedTags ?? [],
    likeCount: video.likeCount,
    favoriteCount: video.favoriteCount,
    commentCount: video.commentCount,
    viewCount: video.viewCount,
    isLiked: options.likedIds?.has(video.id) ?? false,
    isFavorited: options.favoritedIds?.has(video.id) ?? false,
  }
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

function isWithinPublishWindow(video: VideoContent, now: Date) {
  const nowTime = now.getTime()

  return (
    (!video.publishStartAt || video.publishStartAt.getTime() <= nowTime) &&
    (!video.publishEndAt || video.publishEndAt.getTime() >= nowTime)
  )
}

function maskResidentName(name: string) {
  if (name.length <= 1) {
    return "居民"
  }

  return `${name.slice(0, 1)}**`
}
