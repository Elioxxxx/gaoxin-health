import { notFound } from "next/navigation"

import { GaoxinVideoPlayerClient } from "@/components/gaoxin/gaoxin-video-player-client"
import { getVideoWatchData } from "@/server/queries/video-query"

export default async function GaoxinVideoWatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getVideoWatchData(id)

  if (!data) {
    notFound()
  }

  return (
    <GaoxinVideoPlayerClient
      initialVideoId={data.activeVideo.id}
      videos={data.queue}
      initialComments={data.comments}
    />
  )
}
