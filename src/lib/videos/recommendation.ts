export type VideoRecommendationStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED"

export type VideoAudienceMatchMode = "NONE" | "ALL" | "ANY" | "EXCLUDE"

export type VideoRecommendationCandidate = {
  id: string
  title: string
  tags: string[]
  audienceTags?: string[]
  audienceMatchMode?: VideoAudienceMatchMode
  status: VideoRecommendationStatus
  isPinned: boolean
  priority: number
  publishedAt: Date | string
  publishStartAt?: Date | string | null
  publishEndAt?: Date | string | null
}

export type RankedVideoRecommendation<TVideo extends VideoRecommendationCandidate> = {
  video: TVideo
  score: number
  matchedTags: string[]
}

export type RankVideoRecommendationsInput<TVideo extends VideoRecommendationCandidate> = {
  videos: TVideo[]
  residentTags: string[]
  now?: Date
  limit?: number
  viewedVideoIds?: string[]
}

export function rankVideoRecommendations<TVideo extends VideoRecommendationCandidate>({
  videos,
  residentTags,
  now = new Date(),
  limit = 10,
  viewedVideoIds = [],
}: RankVideoRecommendationsInput<TVideo>): Array<RankedVideoRecommendation<TVideo>> {
  const residentTagSet = new Set(residentTags.map(normalizeTag).filter(Boolean))
  const viewedSet = new Set(viewedVideoIds)

  return videos
    .filter((video) => isVideoVisible(video, now, residentTagSet))
    .map((video) => {
      const matchedTags = video.tags.filter((tag) => residentTagSet.has(normalizeTag(tag)))
      const score =
        matchedTags.length * 1000 +
        (video.isPinned ? 100 : 0) +
        video.priority +
        recencyScore(video.publishedAt, now) -
        (viewedSet.has(video.id) ? 120 : 0)

      return { video, score, matchedTags }
    })
    .sort((left, right) => {
      const leftMatchCount = left.matchedTags.length
      const rightMatchCount = right.matchedTags.length

      if (leftMatchCount !== rightMatchCount) {
        return rightMatchCount - leftMatchCount
      }

      if (left.video.isPinned !== right.video.isPinned) {
        return Number(right.video.isPinned) - Number(left.video.isPinned)
      }

      if (left.video.priority !== right.video.priority) {
        return right.video.priority - left.video.priority
      }

      return toTime(right.video.publishedAt) - toTime(left.video.publishedAt)
    })
    .slice(0, limit)
}

export function isVideoVisible(
  video: VideoRecommendationCandidate,
  now = new Date(),
  residentTagSet = new Set<string>()
) {
  if (video.status !== "PUBLISHED") {
    return false
  }

  const nowTime = now.getTime()
  const startTime = video.publishStartAt ? toTime(video.publishStartAt) : undefined
  const endTime = video.publishEndAt ? toTime(video.publishEndAt) : undefined

  return (
    (startTime === undefined || startTime <= nowTime) &&
    (endTime === undefined || endTime >= nowTime) &&
    matchesAudienceRule(video, residentTagSet)
  )
}

export function matchesAudienceRule(
  video: Pick<VideoRecommendationCandidate, "audienceTags" | "audienceMatchMode">,
  residentTagSet: Set<string>
) {
  const audienceTags = (video.audienceTags ?? []).map(normalizeTag).filter(Boolean)
  const mode = video.audienceMatchMode ?? "NONE"

  if (mode === "NONE" || audienceTags.length === 0) {
    return true
  }

  if (mode === "ALL") {
    return audienceTags.every((tag) => residentTagSet.has(tag))
  }

  if (mode === "ANY") {
    return audienceTags.some((tag) => residentTagSet.has(tag))
  }

  return audienceTags.every((tag) => !residentTagSet.has(tag))
}

function normalizeTag(value: string) {
  return value.trim().toLowerCase()
}

function recencyScore(value: Date | string, now: Date) {
  const ageDays = Math.max(0, (now.getTime() - toTime(value)) / 86_400_000)

  return Math.max(0, 30 - Math.floor(ageDays))
}

function toTime(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}
