"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useEffect } from "react"

import { GaoxinVideoThumbnail } from "@/components/gaoxin/gaoxin-video-thumbnail"
import type { VideoCardDto } from "@/server/queries/video-query"

export function GaoxinVideoRecommendations({ videos }: { videos: VideoCardDto[] }) {
  const [mainVideo, ...smallVideos] = videos

  useEffect(() => {
    for (const video of videos) {
      void trackVideoEvent(video.id, "IMPRESSION", { matchedTags: video.matchedTags, pagePath: "/gaoxin" })
    }
  }, [videos])

  if (!mainVideo) {
    return null
  }

  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold text-slate-950">推荐</h2>
          <p className="text-xs font-medium text-slate-400">为你精选健康视频</p>
        </div>
        <Link href="/gaoxin/videos" className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
          更多
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <Link
        href={`/gaoxin/videos/${mainVideo.id}`}
        onClick={() => void trackVideoEvent(mainVideo.id, "CLICK", { matchedTags: mainVideo.matchedTags, pagePath: "/gaoxin" })}
        className="grid grid-cols-[1.08fr_0.92fr] gap-3"
      >
        <GaoxinVideoThumbnail title={mainVideo.title} coverImageUrl={mainVideo.coverImageUrl} />
        <div className="min-w-0 py-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">{mainVideo.title}</h3>
          <p className="mt-2 text-xs text-slate-400">
            {mainVideo.sourceName} · {mainVideo.durationText}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mainVideo.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {smallVideos.slice(0, 2).map((video) => (
          <Link
            key={video.id}
            href={`/gaoxin/videos/${video.id}`}
            onClick={() => void trackVideoEvent(video.id, "CLICK", { matchedTags: video.matchedTags, pagePath: "/gaoxin" })}
            className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 p-2"
          >
            <GaoxinVideoThumbnail title={video.title} coverImageUrl={video.coverImageUrl} compact />
            <div className="flex min-w-0 flex-1 self-stretch py-0.5">
              <p className="line-clamp-4 text-[13px] font-semibold leading-[18px] text-slate-900">{video.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

async function trackVideoEvent(videoId: string, eventType: "IMPRESSION" | "CLICK", metadata: Record<string, unknown>) {
  await fetch(`/api/videos/${videoId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, metadata }),
    keepalive: true,
  }).catch(() => undefined)
}
