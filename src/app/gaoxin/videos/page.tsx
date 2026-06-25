import { redirect } from "next/navigation"

import { getHomeVideoRecommendations } from "@/server/queries/video-query"

export default async function GaoxinVideosPage() {
  const videos = await getHomeVideoRecommendations(1)
  const firstVideo = videos[0]

  if (!firstVideo) {
    return (
      <section className="rounded-[26px] bg-white p-5 text-sm leading-6 text-slate-500 shadow-sm ring-1 ring-slate-100">
        暂无可推荐视频
      </section>
    )
  }

  redirect(`/gaoxin/videos/${firstVideo.id}`)
}
