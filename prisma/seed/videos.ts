import {
  json,
  prisma,
  VideoCommentStatus,
  VideoOrientation,
  VideoPublishStatus,
  VideoSourceType,
} from "./shared"

const demoVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

const tagGroups = [
  { name: "健康科普", category: "服务场景", color: "emerald" },
  { name: "慢病管理", category: "服务场景", color: "emerald" },
  { name: "血压管理", category: "疾病管理", color: "emerald" },
  { name: "报告解读", category: "服务场景", color: "cyan" },
  { name: "儿童健康", category: "人群标签", color: "sky" },
  { name: "血糖管理", category: "疾病管理", color: "emerald" },
  { name: "老年健康", category: "人群标签", color: "amber" },
]

const videos = [
  {
    title: "3分钟了解高血压日常管理",
    summary: "血压监测、用药提醒和复诊建议，帮助居民建立稳定的慢病管理习惯。",
    description:
      "本视频面向高血压和慢病管理人群，介绍居家血压测量、异常值识别、规律用药和社区复诊建议。",
    sourceName: "高新区卫健局",
    durationSeconds: 165,
    orientation: VideoOrientation.LANDSCAPE,
    tags: ["血压管理", "慢病管理", "老年健康", "健康科普"],
    isPinned: true,
    priority: 100,
    publishedAt: "2026-06-18T08:00:00.000Z",
  },
  {
    title: "体检报告怎么看",
    summary: "围绕常见异常指标解释复查和就医建议。",
    description:
      "帮助居民理解体检报告中的血糖、血脂、肝肾功能等常见指标，明确何时需要复查或就医咨询。",
    sourceName: "高新区卫健局",
    durationSeconds: 192,
    orientation: VideoOrientation.LANDSCAPE,
    tags: ["报告解读", "健康科普"],
    isPinned: false,
    priority: 80,
    publishedAt: "2026-06-17T08:00:00.000Z",
  },
  {
    title: "儿童发热护理",
    summary: "儿童发热观察、补液、退热和就医提醒。",
    description:
      "面向儿童家长，介绍发热期间的居家观察重点、退热方式和需要及时就医的危险信号。",
    sourceName: "高新区卫健局",
    durationSeconds: 178,
    orientation: VideoOrientation.PORTRAIT,
    tags: ["儿童健康", "健康科普"],
    isPinned: false,
    priority: 70,
    publishedAt: "2026-06-16T08:00:00.000Z",
  },
  {
    title: "血糖偏高后的饮食建议",
    summary: "从主食、运动和复查三个角度管理血糖风险。",
    description:
      "适合体检血糖偏高、糖尿病风险和慢病管理人群，提供饮食结构、运动频率和复查节点建议。",
    sourceName: "高新区慢病管理中心",
    durationSeconds: 210,
    orientation: VideoOrientation.LANDSCAPE,
    tags: ["血糖管理", "慢病管理", "健康科普"],
    isPinned: false,
    priority: 75,
    publishedAt: "2026-06-15T08:00:00.000Z",
  },
  {
    title: "老年人夏季健康提醒",
    summary: "防暑、补水、用药和慢病监测提醒。",
    description:
      "面向老年居民和家庭照护者，介绍夏季防暑降温、规律用药、慢病监测和紧急情况识别。",
    sourceName: "高新区卫健局",
    durationSeconds: 156,
    orientation: VideoOrientation.PORTRAIT,
    tags: ["老年健康", "慢病管理", "健康科普"],
    isPinned: false,
    priority: 60,
    publishedAt: "2026-06-14T08:00:00.000Z",
  },
]

export async function seedVideos() {
  for (const tag of tagGroups) {
    await prisma.videoTag.create({ data: tag })
  }

  for (const video of videos) {
    await prisma.videoContent.create({
      data: {
        title: video.title,
        summary: video.summary,
        description: video.description,
        sourceName: video.sourceName,
        sourceType: VideoSourceType.EXTERNAL_URL,
        videoUrl: demoVideoUrl,
        coverImageUrl: "",
        durationSeconds: video.durationSeconds,
        orientation: video.orientation,
        status: VideoPublishStatus.PUBLISHED,
        isHomeRecommended: true,
        isPinned: video.isPinned,
        priority: video.priority,
        publishedAt: new Date(video.publishedAt),
        tags: {
          connect: video.tags.map((name) => ({ name })),
        },
      },
    })
  }

  const firstVideo = await prisma.videoContent.findFirst({
    where: { title: "3分钟了解高血压日常管理" },
    include: { tags: true },
  })

  if (firstVideo) {
    await prisma.videoComment.create({
      data: {
        videoId: firstVideo.id,
        residentId: (await prisma.residentProfile.findFirstOrThrow({ select: { id: true } })).id,
        content: "讲得很清楚，准备按视频里的方法记录血压。",
        status: VideoCommentStatus.APPROVED,
      },
    })
    await prisma.videoContent.update({
      where: { id: firstVideo.id },
      data: { commentCount: 1 },
    })
  }

  console.log(`Seed 视频推荐：${videos.length} 条视频，标签 ${json(tagGroups.map((item) => item.name))}`)
}
