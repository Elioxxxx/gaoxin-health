import { AdminPageHeader } from "@/components/admin/admin-section"
import { VideoManager } from "@/components/admin/admin-managers"
import { getAdminVideoDashboard } from "@/server/queries/video-query"

export default async function AdminVideosPage() {
  const data = await getAdminVideoDashboard()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="视频推荐"
        description="维护健康科普视频、标签、人群投放状态和居民留言审核。"
      />
      <VideoManager
        items={JSON.parse(JSON.stringify(data.videos))}
        availableAudienceTags={data.availableAudienceTags}
        pendingComments={data.pendingComments}
      />
    </div>
  )
}
