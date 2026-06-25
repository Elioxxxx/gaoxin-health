import { rankVideoRecommendations, type VideoRecommendationCandidate } from "@/lib/videos/recommendation"

const now = new Date("2026-06-21T10:00:00.000Z")

const fixtures: VideoRecommendationCandidate[] = [
  {
    id: "blood-pressure",
    title: "3分钟了解高血压日常管理",
    tags: ["高血压", "慢病管理", "血压管理"],
    status: "PUBLISHED",
    isPinned: false,
    priority: 20,
    publishedAt: "2026-06-18T08:00:00.000Z",
  },
  {
    id: "blood-sugar",
    title: "血糖偏高后怎么管理",
    tags: ["血糖偏高", "慢病管理"],
    status: "PUBLISHED",
    isPinned: false,
    priority: 80,
    publishedAt: "2026-06-19T08:00:00.000Z",
  },
  {
    id: "general",
    title: "夏季健康科普",
    tags: ["健康科普"],
    status: "PUBLISHED",
    isPinned: true,
    priority: 100,
    publishedAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "draft-match",
    title: "待审核高血压视频",
    tags: ["高血压", "慢病管理"],
    status: "PENDING_REVIEW",
    isPinned: true,
    priority: 1000,
    publishedAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "future-match",
    title: "明日发布高血压视频",
    tags: ["高血压"],
    status: "PUBLISHED",
    isPinned: true,
    priority: 1000,
    publishedAt: "2026-06-20T08:00:00.000Z",
    publishStartAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "expired-match",
    title: "已过期高血压视频",
    tags: ["高血压"],
    status: "PUBLISHED",
    isPinned: true,
    priority: 1000,
    publishedAt: "2026-06-01T08:00:00.000Z",
    publishEndAt: "2026-06-20T00:00:00.000Z",
  },
]

const audienceFixtures: VideoRecommendationCandidate[] = [
  {
    id: "all-target",
    title: "高血压慢病专项视频",
    tags: ["慢病管理"],
    audienceTags: ["高血压", "慢病管理"],
    audienceMatchMode: "ALL",
    status: "PUBLISHED",
    isPinned: false,
    priority: 60,
    publishedAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "any-target",
    title: "慢病人群通用视频",
    tags: ["慢病管理"],
    audienceTags: ["糖尿病", "慢病管理"],
    audienceMatchMode: "ANY",
    status: "PUBLISHED",
    isPinned: false,
    priority: 55,
    publishedAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "exclude-target",
    title: "非慢病人群生活方式视频",
    tags: ["健康科普"],
    audienceTags: ["高血压", "慢病管理"],
    audienceMatchMode: "EXCLUDE",
    status: "PUBLISHED",
    isPinned: false,
    priority: 200,
    publishedAt: "2026-06-20T08:00:00.000Z",
  },
]

const matched = rankVideoRecommendations({
  videos: fixtures,
  residentTags: ["高血压", "慢病管理"],
  now,
  limit: 3,
})

assertIds(
  matched.map((item) => item.video.id),
  ["blood-pressure", "blood-sugar", "general"],
  "标签命中应优先于置顶通用视频，且未发布/过期/未开始视频不展示"
)
assert(
  matched[0]?.matchedTags.join("、") === "高血压、慢病管理",
  "推荐结果应返回可展示的非敏感内容标签命中结果"
)

const fallback = rankVideoRecommendations({
  videos: fixtures,
  residentTags: ["妇女健康"],
  now,
  limit: 2,
})

assertIds(
  fallback.map((item) => item.video.id),
  ["general", "blood-sugar"],
  "无标签命中时应按置顶、优先级和发布时间兜底"
)

const watched = rankVideoRecommendations({
  videos: fixtures,
  residentTags: ["高血压", "慢病管理"],
  viewedVideoIds: ["blood-pressure"],
  now,
  limit: 3,
})

assert(
  watched.some((item) => item.video.id === "blood-pressure"),
  "已观看视频可以降权，但不能被强制过滤"
)

const targeted = rankVideoRecommendations({
  videos: audienceFixtures,
  residentTags: ["高血压", "慢病管理"],
  now,
  limit: 10,
})

assert(
  targeted.some((item) => item.video.id === "all-target"),
  "全部匹配投放应在居民具备所有目标标签时可见"
)
assert(
  targeted.some((item) => item.video.id === "any-target"),
  "任一匹配投放应在居民具备任一目标标签时可见"
)
assert(
  !targeted.some((item) => item.video.id === "exclude-target"),
  "排除匹配投放应在居民具备任一目标标签时隐藏"
)

const excludedAudience = rankVideoRecommendations({
  videos: audienceFixtures,
  residentTags: ["妇女健康"],
  now,
  limit: 10,
})

assert(
  excludedAudience.some((item) => item.video.id === "exclude-target"),
  "排除匹配投放应在居民不具备任何目标标签时可见"
)

console.log("VIDEO RECOMMENDATION CHECK")
console.log("==========================")
console.log("matched:", matched.map((item) => `${item.video.id}:${item.score}`).join(", "))
console.log("fallback:", fallback.map((item) => `${item.video.id}:${item.score}`).join(", "))
console.log("watched:", watched.map((item) => `${item.video.id}:${item.score}`).join(", "))

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function assertIds(actual: string[], expected: string[], message: string) {
  const actualText = actual.join(",")
  const expectedText = expected.join(",")

  assert(actualText === expectedText, `${message}。期望 ${expectedText}，实际 ${actualText}`)
}
