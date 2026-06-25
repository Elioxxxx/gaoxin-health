"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Send,
  Share2,
  Star,
} from "lucide-react"

import type { VideoCardDto } from "@/server/queries/video-query"

type VideoCommentDto = {
  id: string
  authorName: string
  content: string
  createdAt: string
}

export function GaoxinVideoPlayerClient({
  initialVideoId,
  videos,
  initialComments,
}: {
  initialVideoId: string
  videos: VideoCardDto[]
  initialComments: VideoCommentDto[]
}) {
  const initialIndex = Math.max(0, videos.findIndex((video) => video.id === initialVideoId))
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [items, setItems] = useState(videos)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentsByVideo, setCommentsByVideo] = useState<Record<string, VideoCommentDto[]>>({
    [initialVideoId]: initialComments,
  })
  const [commentText, setCommentText] = useState("")
  const [notice, setNotice] = useState("")
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const touchStartY = useRef<number | null>(null)
  const activeVideo = items[activeIndex]
  const activeVideoId = activeVideo?.id ?? ""
  const activeComments = activeVideo ? commentsByVideo[activeVideo.id] ?? [] : []

  useEffect(() => {
    if (!activeVideoId) {
      return
    }

    void trackEvent(activeVideoId, "IMPRESSION")
    videoRef.current?.pause()
  }, [activeVideoId])

  useEffect(() => {
    if (!activeVideoId) {
      return
    }

    if (!commentsByVideo[activeVideoId]) {
      void fetch(`/api/videos/${activeVideoId}`)
        .then((response) => response.json())
        .then((payload: { data?: { comments?: VideoCommentDto[] } }) => {
          setCommentsByVideo((current) => ({
            ...current,
            [activeVideoId]: payload.data?.comments ?? [],
          }))
        })
        .catch(() => undefined)
    }
  }, [activeVideoId, commentsByVideo])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, activeVideo?.id])

  const canGoPrevious = activeIndex > 0
  const canGoNext = activeIndex < items.length - 1
  const videoClassName = useMemo(
    () => (activeVideo?.orientation === "PORTRAIT" ? "h-full w-full object-cover" : "h-full w-full object-contain"),
    [activeVideo?.orientation]
  )

  if (!activeVideo) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center text-sm text-slate-500">
        暂无可播放视频
      </section>
    )
  }

  async function togglePlay() {
    const nextPlaying = !playing
    setPlaying(nextPlaying)

    if (nextPlaying) {
      await videoRef.current?.play().catch(() => undefined)
      void trackEvent(activeVideo.id, "PLAY", { playbackRate })
    } else {
      videoRef.current?.pause()
      void trackEvent(activeVideo.id, "PAUSE", { progressSeconds: Math.floor(videoRef.current?.currentTime ?? 0) })
    }
  }

  function go(offset: number) {
    setPlaying(false)
    setNotice("")
    setActiveIndex((current) => Math.min(items.length - 1, Math.max(0, current + offset)))
  }

  async function toggleInteraction(type: "LIKE" | "FAVORITE") {
    const response = await fetch(`/api/videos/${activeVideo.id}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
    const payload = (await response.json().catch(() => null)) as
      | { data?: { interaction?: { active: boolean; likeCount: number; favoriteCount: number } } }
      | null
    const interaction = payload?.data?.interaction

    if (!interaction) {
      return
    }

    setItems((current) =>
      current.map((video) =>
        video.id === activeVideo.id
          ? {
              ...video,
              isLiked: type === "LIKE" ? interaction.active : video.isLiked,
              isFavorited: type === "FAVORITE" ? interaction.active : video.isFavorited,
              likeCount: interaction.likeCount,
              favoriteCount: interaction.favoriteCount,
            }
          : video
      )
    )
  }

  async function submitComment() {
    const content = commentText.trim()

    if (!content) {
      return
    }

    const response = await fetch(`/api/videos/${activeVideo.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (response.ok) {
      setCommentText("")
      setNotice("留言已提交，审核通过后公开展示")
    } else {
      setNotice("留言提交失败，请稍后重试")
    }
  }

  return (
    <section
      className="relative min-h-[calc(100dvh-52px)] overflow-hidden bg-slate-950 text-white"
      onWheel={(event) => {
        if (Math.abs(event.deltaY) < 30) {
          return
        }
        go(event.deltaY > 0 ? 1 : -1)
      }}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0]?.clientY ?? null
      }}
      onTouchEnd={(event) => {
        const startY = touchStartY.current
        const endY = event.changedTouches[0]?.clientY
        touchStartY.current = null

        if (startY === null || endY === undefined || Math.abs(startY - endY) < 44) {
          return
        }

        go(startY > endY ? 1 : -1)
      }}
    >
      <div className="absolute inset-0">
        {activeVideo.videoUrl ? (
          <video
            key={activeVideo.id}
            ref={videoRef}
            src={activeVideo.videoUrl}
            poster={activeVideo.coverImageUrl || undefined}
            className={videoClassName}
            playsInline
            onEnded={() => {
              setPlaying(false)
              void trackEvent(activeVideo.id, "COMPLETE")
              if (canGoNext) {
                go(1)
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0f766e,#0ea5e9)] px-8 text-center text-sm text-white/80">
            视频地址待配置
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.2)_0%,rgba(15,23,42,0.05)_40%,rgba(15,23,42,0.78)_100%)]" />

      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3">
        <ActionButton disabled={!canGoPrevious} icon={<ChevronUp className="size-5" />} label="上一条" onClick={() => go(-1)} />
        <ActionButton
          active={activeVideo.isLiked}
          icon={<Heart className={activeVideo.isLiked ? "size-5 fill-white" : "size-5"} />}
          label={formatCount(activeVideo.likeCount)}
          onClick={() => void toggleInteraction("LIKE")}
        />
        <ActionButton
          active={activeVideo.isFavorited}
          icon={<Star className={activeVideo.isFavorited ? "size-5 fill-white" : "size-5"} />}
          label={formatCount(activeVideo.favoriteCount)}
          onClick={() => void toggleInteraction("FAVORITE")}
        />
        <ActionButton icon={<MessageCircle className="size-5" />} label={formatCount(activeVideo.commentCount)} onClick={() => setCommentsOpen(true)} />
        <ActionButton icon={<Share2 className="size-5" />} label="分享" onClick={() => void trackEvent(activeVideo.id, "SHARE")} />
        <ActionButton disabled={!canGoNext} icon={<ChevronDown className="size-5" />} label="下一条" onClick={() => go(1)} />
      </div>

      <div className="absolute bottom-0 left-0 right-16 z-10 space-y-3 p-5 pb-6">
        <div className="flex flex-wrap gap-1.5">
          {activeVideo.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-white/16 px-2 py-1 text-[11px] font-medium text-white ring-1 ring-white/20 backdrop-blur">
              {tag}
            </span>
          ))}
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-7">{activeVideo.title}</h1>
          <p className="mt-1 text-xs font-medium text-white/70">
            {activeVideo.sourceName} · {activeVideo.durationText}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/78">{activeVideo.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void togglePlay()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-slate-950" />}
            {playing ? "暂停" : "播放"}
          </button>
          {[1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => {
                setPlaybackRate(rate)
                void trackEvent(activeVideo.id, "SPEED_CHANGE", { playbackRate: rate })
              }}
              className={`h-9 rounded-full px-3 text-xs font-semibold ring-1 ring-white/20 ${
                playbackRate === rate ? "bg-emerald-400 text-slate-950" : "bg-white/12 text-white"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {commentsOpen ? (
        <div className="absolute inset-0 z-20 flex items-end bg-slate-950/35">
          <div className="max-h-[72vh] w-full rounded-t-[28px] bg-white p-4 text-slate-950 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">留言</h2>
                <p className="text-xs text-slate-400">审核通过后公开展示</p>
              </div>
              <button type="button" onClick={() => setCommentsOpen(false)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                关闭
              </button>
            </div>
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {activeComments.length > 0 ? (
                activeComments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">{comment.authorName}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">暂无公开留言</p>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="写下你的健康学习反馈"
                className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-emerald-300"
              />
              <button type="button" onClick={() => void submitComment()} className="flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Send className="size-4" />
              </button>
            </div>
            {notice ? <p className="mt-2 text-xs text-emerald-600">{notice}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ActionButton({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-14 flex-col items-center gap-1 text-[11px] font-semibold ${
        disabled ? "text-white/30" : active ? "text-emerald-200" : "text-white"
      }`}
    >
      <span className={`flex size-11 items-center justify-center rounded-full ${active ? "bg-emerald-500" : "bg-white/16"} backdrop-blur`}>
        {icon}
      </span>
      {label}
    </button>
  )
}

async function trackEvent(videoId: string, eventType: string, metadata?: Record<string, unknown>) {
  await fetch(`/api/videos/${videoId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, metadata }),
    keepalive: true,
  }).catch(() => undefined)
}

function formatCount(value: number) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }

  return String(value)
}
