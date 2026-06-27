"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, Plus, Save, Upload, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { parseJsonArray } from "@/lib/json"
import { getSupportedVideoFormat } from "@/lib/videos/video-format"

type Institution = {
  id: string
  name: string
  type: string
  level: string
  address: string
  description: string
  capabilities: string
  departments?: unknown[]
  doctors?: unknown[]
}

type Department = {
  id: string
  institutionId: string
  name: string
  description: string
  symptomKeywords: string
  diseaseKeywords: string
  institution?: { name: string }
  doctors?: unknown[]
}

type Doctor = {
  id: string
  institutionId: string
  departmentId: string
  name: string
  title: string
  specialties: string
  isExpert: boolean
  introduction: string
  institution?: { name: string; type: string }
  department?: { name: string }
}

type Rule = {
  id: string
  name: string
  priority: number
  enabled: boolean
  symptomKeywords: string
  riskFactors: string
  triageLevel: string
  suggestedDepartment: string
  suggestedCareType: string
  explanation: string
}

type KnowledgeDocument = {
  id: string
  title: string
  category: string
  source: string
  content: string
  tags: string
  chunks?: unknown[]
}

type VideoContentItem = {
  id: string
  title: string
  summary: string
  description: string
  sourceName: string
  sourceType: string
  videoUrl?: string | null
  uploadPath?: string | null
  coverImageUrl?: string | null
  durationSeconds: number
  orientation: string
  status: string
  audienceTagNames: string[]
  audienceMatchMode: string
  isHomeRecommended: boolean
  isPinned: boolean
  priority: number
  publishedAt: string
  publishStartAt?: string | null
  publishEndAt?: string | null
  viewCount: number
  completionCount: number
  likeCount: number
  favoriteCount: number
  commentCount: number
  tagNames: string[]
}

type AvailableAudienceTag = {
  name: string
  category: string
}

type PendingVideoComment = {
  id: string
  videoTitle: string
  residentName: string
  content: string
  status: string
  createdAt: string
}

type CoverFrameMode = "FIRST" | "LAST"

type VideoUploadResponse = {
  uploadPath: string
  coverImageUrl: string
}

type AgentRun = {
  id: string
  sessionId?: string | null
  agentName: string
  inputJson: string
  outputJson: string
  status: string
  latencyMs: number
  createdAt: string
}

type QualityIssue = {
  id: string
  title: string
  description: string
  severity: string
  status: string
  createdAt: string
}

type AgentFeedback = {
  id: string
  rating: number
  comment: string
  source: string
  createdAt: string
}

export function InstitutionManager({ items }: { items: Institution[] }) {
  const [keyword, setKeyword] = useState("")
  const [type, setType] = useState("all")
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (type === "all" || item.type === type) &&
          `${item.name} ${item.address}`.includes(keyword)
      ),
    [items, keyword, type]
  )

  return (
    <ManagerFrame
      createTitle="新增机构"
      createEndpoint="/api/admin/institutions"
      fields={institutionFields}
    >
      <Toolbar keyword={keyword} setKeyword={setKeyword}>
        <select value={type} onChange={(event) => setType(event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
          <option value="all">全部</option>
          <option value="TERTIARY_HOSPITAL">三甲医院</option>
          <option value="COMMUNITY_HEALTH_CENTER">社区卫生服务中心</option>
        </select>
      </Toolbar>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>等级</TableHead>
            <TableHead>地址</TableHead>
            <TableHead>服务能力</TableHead>
            <TableHead>科室/医生</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.type === "TERTIARY_HOSPITAL" ? "三甲医院" : "社区中心"}</TableCell>
              <TableCell>{item.level}</TableCell>
              <TableCell className="max-w-[240px] whitespace-normal text-sm text-slate-600">{item.address}</TableCell>
              <TableCell className="max-w-[260px] whitespace-normal text-xs text-slate-600">{parseJsonArray(item.capabilities).join("、")}</TableCell>
              <TableCell>{item.departments?.length ?? 0} / {item.doctors?.length ?? 0}</TableCell>
              <TableCell>
                <EditButton title="编辑机构" endpoint={`/api/admin/institutions/${item.id}`} fields={institutionFields} values={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ManagerFrame>
  )
}

export function DepartmentManager({ items, institutions }: { items: Department[]; institutions: Institution[] }) {
  const [institutionId, setInstitutionId] = useState("all")
  const visible = items.filter((item) => institutionId === "all" || item.institutionId === institutionId)
  const fields = departmentFields(institutions)

  return (
    <ManagerFrame createTitle="新增科室" createEndpoint="/api/admin/departments" fields={fields}>
      <Toolbar keyword="" setKeyword={() => undefined}>
        <select value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
          <option value="all">全部机构</option>
          {institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </Toolbar>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>科室</TableHead>
            <TableHead>机构</TableHead>
            <TableHead>症状关键词</TableHead>
            <TableHead>疾病关键词</TableHead>
            <TableHead>医生数</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.institution?.name}</TableCell>
              <TableCell className="max-w-[260px] whitespace-normal text-xs">{parseJsonArray(item.symptomKeywords).join("、")}</TableCell>
              <TableCell className="max-w-[260px] whitespace-normal text-xs">{parseJsonArray(item.diseaseKeywords).join("、")}</TableCell>
              <TableCell>{item.doctors?.length ?? 0}</TableCell>
              <TableCell><EditButton title="编辑科室" endpoint={`/api/admin/departments/${item.id}`} fields={fields} values={item} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ManagerFrame>
  )
}

export function DoctorManager({ items, institutions, departments }: { items: Doctor[]; institutions: Institution[]; departments: Department[] }) {
  const [filter, setFilter] = useState("all")
  const [keyword, setKeyword] = useState("")
  const fields = doctorFields(institutions, departments)
  const visible = items.filter((item) => {
    const matchesKeyword = item.name.includes(keyword)
    const matchesFilter =
      filter === "all" ||
      (filter === "expert" && item.isExpert) ||
      (filter === "normal" && !item.isExpert && item.institution?.type === "TERTIARY_HOSPITAL") ||
      (filter === "community" && item.institution?.type === "COMMUNITY_HEALTH_CENTER")
    return matchesKeyword && matchesFilter
  })

  return (
    <ManagerFrame createTitle="新增医生" createEndpoint="/api/admin/doctors" fields={fields}>
      <Toolbar keyword={keyword} setKeyword={setKeyword}>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
          <option value="all">全部</option>
          <option value="expert">专家池</option>
          <option value="normal">普通医生</option>
          <option value="community">社区医生</option>
        </select>
      </Toolbar>
      <Table>
        <TableHeader><TableRow><TableHead>医生</TableHead><TableHead>机构/科室</TableHead><TableHead>专家池</TableHead><TableHead>擅长方向</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
        <TableBody>
          {visible.map((item) => (
            <TableRow key={item.id}>
              <TableCell><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.title}</div></TableCell>
              <TableCell>{item.institution?.name} / {item.department?.name}</TableCell>
              <TableCell>{item.isExpert ? "是" : "否"}</TableCell>
              <TableCell className="max-w-[320px] whitespace-normal text-xs">{parseJsonArray(item.specialties).join("、")}</TableCell>
              <TableCell><EditButton title="编辑医生" endpoint={`/api/admin/doctors/${item.id}`} fields={fields} values={item} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ManagerFrame>
  )
}

export function RuleManager({ items }: { items: Rule[] }) {
  return (
    <ManagerFrame createTitle="新增规则" createEndpoint="/api/admin/rules" fields={ruleFields}>
      <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        第一版规则用于演示 P0-P4 分诊和资源匹配，可由卫健端维护。真实生产环境需结合医疗专家审核。
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>规则</TableHead><TableHead>条件</TableHead><TableHead>等级</TableHead><TableHead>建议科室</TableHead><TableHead>建议动作</TableHead><TableHead>启用</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="max-w-[260px] whitespace-normal text-xs">{[...parseJsonArray(item.symptomKeywords), ...parseJsonArray(item.riskFactors)].join("、")}</TableCell>
              <TableCell>{item.triageLevel}</TableCell>
              <TableCell>{item.suggestedDepartment}</TableCell>
              <TableCell>{item.suggestedCareType}</TableCell>
              <TableCell>{item.enabled ? "启用" : "停用"}</TableCell>
              <TableCell><EditButton title="编辑规则" endpoint={`/api/admin/rules/${item.id}`} fields={ruleFields} values={item} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ManagerFrame>
  )
}

export function KnowledgeManager({ items }: { items: KnowledgeDocument[] }) {
  return (
    <ManagerFrame createTitle="新增知识文档" createEndpoint="/api/admin/knowledge-documents" fields={knowledgeFields}>
      <Table>
        <TableHeader><TableRow><TableHead>标题</TableHead><TableHead>类型</TableHead><TableHead>标签</TableHead><TableHead>引用次数</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="max-w-[280px] whitespace-normal text-xs">{parseJsonArray(item.tags).join("、")}</TableCell>
              <TableCell>{item.chunks?.length ?? 0}</TableCell>
              <TableCell>启用</TableCell>
              <TableCell><EditButton title="编辑知识文档" endpoint={`/api/admin/knowledge-documents/${item.id}`} fields={knowledgeFields} values={item} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ManagerFrame>
  )
}

export function VideoManager({
  items,
  availableAudienceTags,
  pendingComments,
}: {
  items: VideoContentItem[]
  availableAudienceTags: AvailableAudienceTag[]
  pendingComments: PendingVideoComment[]
}) {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState("all")
  const visible = items.filter((item) => {
    const text = `${item.title} ${item.summary} ${item.tagNames.join(" ")}`
    return text.includes(keyword) && (status === "all" || item.status === status)
  })

  async function reviewComment(id: string, nextStatus: "APPROVED" | "REJECTED") {
    const response = await fetch(`/api/admin/videos/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!response.ok) {
      window.alert("留言审核失败")
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="视频总数" value={items.length} />
        <MiniStat label="已发布" value={items.filter((item) => item.status === "PUBLISHED").length} />
        <MiniStat label="待审核留言" value={pendingComments.length} />
        <MiniStat label="累计播放" value={items.reduce((sum, item) => sum + item.viewCount, 0)} />
      </div>

      {pendingComments.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-950">待审核留言</h3>
            <span className="text-xs text-amber-700">审核通过后居民端公开展示</span>
          </div>
          <div className="space-y-2">
            {pendingComments.map((comment) => (
              <div key={comment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-950">{comment.videoTitle}</p>
                  <p className="mt-1 text-slate-600">{comment.residentName}：{comment.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void reviewComment(comment.id, "REJECTED")}>
                    <XCircle className="size-4" />
                    驳回
                  </Button>
                  <Button size="sm" onClick={() => void reviewComment(comment.id, "APPROVED")}>
                    <CheckCircle2 className="size-4" />
                    通过
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex justify-end">
          <VideoFormButton
            title="新增视频"
            endpoint="/api/admin/videos"
            method="POST"
            availableAudienceTags={availableAudienceTags}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
        <Toolbar keyword={keyword} setKeyword={setKeyword}>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
            <option value="all">全部状态</option>
            <option value="DRAFT">草稿</option>
            <option value="PENDING_REVIEW">待审核</option>
            <option value="PUBLISHED">已发布</option>
            <option value="ARCHIVED">已下架</option>
          </select>
        </Toolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>视频</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>投放</TableHead>
              <TableHead>数据</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 max-w-[320px] text-xs leading-5 text-slate-500">{item.summary}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.sourceName} · {Math.round(item.durationSeconds / 60)} 分钟</div>
                </TableCell>
                <TableCell className="max-w-[260px] whitespace-normal text-xs">{item.tagNames.join("、")}</TableCell>
                <TableCell className="text-sm">
                  <div>{item.isHomeRecommended ? "首页推荐" : "非首页"}</div>
                  <div className="text-xs text-slate-400">{item.isPinned ? "置顶" : "普通"} · 优先级 {item.priority}</div>
                  <div className="mt-1 max-w-[240px] text-xs text-slate-500">
                    {audienceRuleLabel(item.audienceMatchMode, item.audienceTagNames)}
                  </div>
                </TableCell>
                <TableCell className="text-xs leading-5 text-slate-500">
                  播放 {item.viewCount}<br />
                  点赞 {item.likeCount} / 收藏 {item.favoriteCount}<br />
                  留言 {item.commentCount}
                </TableCell>
                <TableCell>{statusLabel(item.status)}</TableCell>
                <TableCell>
                  <VideoFormButton
                    title="编辑视频"
                    endpoint={`/api/admin/videos/${item.id}`}
                    method="PUT"
                    availableAudienceTags={availableAudienceTags}
                    values={{
                      ...item,
                      tags: item.tagNames,
                      audienceTags: item.audienceTagNames,
                      publishedAt: toInputDate(item.publishedAt),
                      publishStartAt: toInputDate(item.publishStartAt),
                      publishEndAt: toInputDate(item.publishEndAt),
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}

export function AgentRunsClient({ items }: { items: AgentRun[] }) {
  const [agentName, setAgentName] = useState("all")
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState<AgentRun | null>(null)
  const agents = Array.from(new Set(items.map((item) => item.agentName)))
  const visible = items.filter((item) => (agentName === "all" || item.agentName === agentName) && (status === "all" || item.status === status))

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={agentName} onChange={(event) => setAgentName(event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
          <option value="all">全部 Agent</option>
          {agents.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
          <option value="all">全部状态</option>
          <option value="SUCCESS">success</option>
          <option value="FAILED">failed</option>
        </select>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>状态</TableHead><TableHead>耗时</TableHead><TableHead>sessionId</TableHead><TableHead>时间</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
        <TableBody>
          {visible.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.agentName}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.latencyMs}ms</TableCell>
              <TableCell className="max-w-[220px] truncate">{item.sessionId}</TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleString("zh-CN")}</TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => setSelected(item)}><Eye className="size-4" />详情</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Agent 调用详情</DialogTitle></DialogHeader>
          {selected ? <pre className="max-h-[70vh] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-50">{JSON.stringify(selected, null, 2)}</pre> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function QualityClient({ issues, feedback }: { issues: QualityIssue[]; feedback: AgentFeedback[] }) {
  const router = useRouter()
  const accurateCount = feedback.filter((item) => item.rating >= 4).length
  const departmentErrorCount = feedback.filter((item) => item.comment.includes("推荐科室是否准确：不准确")).length
  const summaryBadCount = feedback.filter((item) => item.comment.includes("健康摘要是否有帮助：无帮助")).length

  async function updateStatus(id: string, status: string) {
    try {
      const response = await fetch(`/api/admin/quality-issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("质量问题状态更新失败")
      }

      router.refresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "质量问题状态更新失败")
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat label="医生认为分诊准确数量" value={accurateCount} />
        <MiniStat label="推荐科室错误数量" value={departmentErrorCount} />
        <MiniStat label="健康摘要无帮助数量" value={summaryBadCount} />
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>问题</TableHead><TableHead>严重级别</TableHead><TableHead>状态</TableHead><TableHead>错误案例</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
        <TableBody>
          {issues.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.severity}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell className="max-w-[420px] whitespace-normal text-sm text-slate-600">{item.description}</TableCell>
              <TableCell>
                <select value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value)} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                  <option value="OPEN">OPEN</option>
                  <option value="REVIEWING">REVIEWING</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ManagerFrame({ createTitle, createEndpoint, fields, children }: { createTitle: string; createEndpoint: string; fields: Field[]; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton title={createTitle} endpoint={createEndpoint} fields={fields} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">{children}</div>
    </div>
  )
}

function Toolbar({ keyword, setKeyword, children }: { keyword: string; setKeyword: (value: string) => void; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {setKeyword.toString() !== (() => undefined).toString() ? (
        <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索名称" className="h-9 w-64" />
      ) : null}
      {children}
    </div>
  )
}

type Field = {
  name: string
  label: string
  type?: "text" | "textarea" | "select" | "boolean" | "json"
  options?: Array<{ label: string; value: string }>
}

function CreateButton({ title, endpoint, fields }: { title: string; endpoint: string; fields: Field[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="size-4" />{title}</Button>
      <FormDialog open={open} setOpen={setOpen} title={title} endpoint={endpoint} method="POST" fields={fields} />
    </>
  )
}

function EditButton({ title, endpoint, fields, values }: { title: string; endpoint: string; fields: Field[]; values: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>编辑</Button>
      <FormDialog open={open} setOpen={setOpen} title={title} endpoint={endpoint} method="PUT" fields={fields} values={values} />
    </>
  )
}

function FormDialog({ open, setOpen, title, endpoint, method, fields, values = {} }: { open: boolean; setOpen: (open: boolean) => void; title: string; endpoint: string; method: "POST" | "PUT"; fields: Field[]; values?: Record<string, unknown> }) {
  const router = useRouter()
  const [error, setError] = useState("")

  async function submit(formData: FormData) {
    setError("")
    const body: Record<string, unknown> = {}
    for (const field of fields) {
      const raw = formData.get(field.name)
      if (field.type === "boolean") {
        body[field.name] = raw === "on"
      } else if (field.type === "json") {
        body[field.name] = String(raw ?? "").split(/[，,\n]/).map((item) => item.trim()).filter(Boolean)
      } else if (raw !== null && String(raw).length > 0) {
        body[field.name] = String(raw)
      }
    }
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        throw new Error(payload?.error?.message ?? "保存失败，请检查填写内容")
      }

      setOpen(false)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败，请稍后重试")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form action={submit} className="space-y-3">
          {fields.map((field) => (
            <label key={field.name} className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">{field.label}</span>
              <FieldInput field={field} value={values[field.name]} />
            </label>
          ))}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit"><Save className="size-4" />保存</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VideoFormButton({
  title,
  endpoint,
  method,
  availableAudienceTags,
  values = {},
}: {
  title: string
  endpoint: string
  method: "POST" | "PUT"
  availableAudienceTags: AvailableAudienceTag[]
  values?: Record<string, unknown>
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size={method === "PUT" ? "sm" : "default"} variant={method === "PUT" ? "outline" : "default"} onClick={() => setOpen(true)}>
        {method === "POST" ? <Plus className="size-4" /> : null}
        {method === "POST" ? title : "编辑"}
      </Button>
      <VideoFormDialog
        open={open}
        setOpen={setOpen}
        title={title}
        endpoint={endpoint}
        method={method}
        availableAudienceTags={availableAudienceTags}
        values={values}
      />
    </>
  )
}

function VideoFormDialog({
  open,
  setOpen,
  title,
  endpoint,
  method,
  availableAudienceTags,
  values,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  endpoint: string
  method: "POST" | "PUT"
  availableAudienceTags: AvailableAudienceTag[]
  values: Record<string, unknown>
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [sourceType, setSourceType] = useState(String(values.sourceType ?? "EXTERNAL_URL"))
  const [videoUrl, setVideoUrl] = useState(String(values.videoUrl ?? ""))
  const [uploadPath, setUploadPath] = useState(String(values.uploadPath ?? ""))
  const [coverImageUrl, setCoverImageUrl] = useState(String(values.coverImageUrl ?? ""))
  const [durationSeconds, setDurationSeconds] = useState(Number(values.durationSeconds ?? 1))
  const [videoOrientation, setVideoOrientation] = useState(String(values.orientation ?? "PORTRAIT"))
  const [coverFrameMode, setCoverFrameMode] = useState<CoverFrameMode>("LAST")
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const audienceTags = parseValueList(values.audienceTags)
  const knownAudienceTags = new Set(availableAudienceTags.map((tag) => tag.name))
  const customAudienceTags = audienceTags.filter((tag) => !knownAudienceTags.has(tag))

  async function submit(formData: FormData) {
    setError("")
    const selectedAudienceTags = formData.getAll("audienceTagOption").map(String)
    const customTargetTags = parseListInput(String(formData.get("customAudienceTags") ?? ""))
    const summaryDescription = String(formData.get("summaryDescription") ?? "").trim()
    const generatedPlaceholder = "视频已上传，待大模型自动分析后生成摘要和详情。"

    if (sourceType === "UPLOAD" && !uploadPath) {
      setError("请先选择本地 mp4 视频并完成上传")
      return
    }

    if (sourceType === "EXTERNAL_URL" && !videoUrl.trim()) {
      setError("请填写视频外链地址")
      return
    }

    const body = {
      title: String(formData.get("title") ?? ""),
      summary: summaryDescription || generatedPlaceholder,
      description: summaryDescription || generatedPlaceholder,
      sourceName: String(formData.get("sourceName") ?? ""),
      sourceType,
      videoUrl: sourceType === "EXTERNAL_URL" ? videoUrl : "",
      uploadPath: sourceType === "UPLOAD" ? uploadPath : "",
      coverImageUrl,
      durationSeconds: String(Math.max(1, Math.round(durationSeconds || 1))),
      orientation: videoOrientation,
      status: String(formData.get("status") ?? "PENDING_REVIEW"),
      tags: parseListInput(String(formData.get("tags") ?? "")),
      audienceTags: Array.from(new Set([...selectedAudienceTags, ...customTargetTags])),
      audienceMatchMode: String(formData.get("audienceMatchMode") ?? "NONE"),
      priority: String(formData.get("priority") ?? "50"),
      publishedAt: String(formData.get("publishedAt") ?? ""),
      publishStartAt: String(formData.get("publishStartAt") ?? ""),
      publishEndAt: String(formData.get("publishEndAt") ?? ""),
      isHomeRecommended: formData.get("isHomeRecommended") === "on",
      isPinned: formData.get("isPinned") === "on",
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        throw new Error(payload?.error?.message ?? "保存失败，请检查填写内容")
      }

      setOpen(false)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败，请稍后重试")
    }
  }

  async function uploadSelectedVideo(file: File, frameMode: CoverFrameMode) {
    setError("")
    setUploadStatus("正在读取视频信息...")

    try {
      if (file.type !== "video/mp4" || !file.name.toLowerCase().endsWith(".mp4")) {
        throw new Error("当前仅支持 mp4 视频")
      }

      const metadata = await readLocalVideoMetadata(file)
      const videoFormat = getSupportedVideoFormat(metadata.width, metadata.height)

      if (!videoFormat) {
        throw new Error(`当前仅支持 9:16 竖屏或 16:9 横屏 mp4 视频，当前视频为 ${metadata.width}×${metadata.height}`)
      }

      setUploadStatus(frameMode === "LAST" ? "正在读取视频最后一帧..." : "正在读取视频第一帧...")
      const cover = await captureVideoFrame(file, frameMode, metadata.duration)
      const uploadForm = new FormData()
      uploadForm.set("video", file)
      uploadForm.set("cover", cover, "cover.jpg")

      setUploadStatus("正在上传视频...")
      const response = await fetch("/api/admin/videos/upload", {
        method: "POST",
        body: uploadForm,
      })
      const payload = (await response.json().catch(() => null)) as
        | { data?: VideoUploadResponse; error?: { message?: string } }
        | null

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error?.message ?? "视频上传失败")
      }

      setUploadPath(payload.data.uploadPath)
      setCoverImageUrl(payload.data.coverImageUrl)
      setDurationSeconds(metadata.duration)
      setVideoOrientation(videoFormat.orientation)
      setSourceType("UPLOAD")
      setUploadStatus(`上传完成：${metadata.width}×${metadata.height}，${videoFormat.label}，${formatSeconds(metadata.duration)}`)
    } catch (uploadError) {
      setUploadStatus("")
      setError(uploadError instanceof Error ? uploadError.message : "视频上传失败，请重新选择文件")
    }
  }

  function handleVideoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedVideoFile(file)
    void uploadSelectedVideo(file, coverFrameMode)
  }

  function handleCoverFrameChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextMode = event.target.value as CoverFrameMode
    setCoverFrameMode(nextMode)

    if (selectedVideoFile) {
      void uploadSelectedVideo(selectedVideoFile, nextMode)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] w-[min(1040px,calc(100vw-2rem))] max-w-none overflow-hidden p-0 sm:max-w-none">
        <form action={submit} className="flex max-h-[92vh] flex-col">
          <DialogHeader className="border-b border-slate-200 px-5 py-4">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 overflow-y-auto px-5 py-4 lg:grid-cols-[1fr_1fr]">
            <VideoFormSection title="基础信息">
              <VideoTextField name="title" label="标题" value={values.title} />
              <VideoTextField name="sourceName" label="来源机构" value={values.sourceName ?? "高新区卫健局"} />
              <VideoTextareaField
                name="summaryDescription"
                label="摘要/详情"
                value={String(values.description ?? values.summary ?? "")}
                rows={6}
                help="当前可留空；后续上传视频后将由大模型自动分析并生成摘要和详情。"
              />
            </VideoFormSection>

            <VideoFormSection title="媒体配置">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">视频来源</span>
                <select
                  name="sourceType"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value)}
                  className="h-9 rounded-md border border-slate-200 px-2 text-sm"
                >
                  <option value="EXTERNAL_URL">外链</option>
                  <option value="UPLOAD">上传文件</option>
                </select>
              </label>
              <p className="text-xs leading-5 text-slate-400">当前支持 9:16 竖屏和 16:9 横屏 mp4 视频；时长和视频规格由系统自动读取。</p>
              {sourceType === "EXTERNAL_URL" ? (
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">外链地址</span>
                  <Input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="h-9" />
                </label>
              ) : (
                <div className="space-y-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">本地视频文件</span>
                    <span className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
                      <Upload className="size-4" />
                      选择本地 mp4 文件上传
                      <input type="file" accept="video/mp4,.mp4" className="sr-only" onChange={handleVideoFileChange} />
                    </span>
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">封面帧</span>
                    <select value={coverFrameMode} onChange={handleCoverFrameChange} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
                      <option value="FIRST">使用视频第一帧</option>
                      <option value="LAST">使用视频最后一帧</option>
                    </select>
                  </label>
                  {coverImageUrl ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <div
                        className={`${videoOrientation === "LANDSCAPE" ? "aspect-video" : "aspect-[9/16]"} max-h-52 bg-cover bg-center`}
                        style={{ backgroundImage: `url("${escapeCssUrl(coverImageUrl)}")` }}
                      />
                      <p className="truncate px-3 py-2 text-xs text-slate-500">{uploadPath || "封面已生成"}</p>
                    </div>
                  ) : null}
                  {uploadStatus ? <p className="text-xs text-emerald-600">{uploadStatus}</p> : null}
                </div>
              )}
              <input type="hidden" name="videoUrl" value={videoUrl} />
              <input type="hidden" name="uploadPath" value={uploadPath} />
              <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
              <input type="hidden" name="durationSeconds" value={Math.max(1, Math.round(durationSeconds || 1))} />
              <input type="hidden" name="orientation" value={videoOrientation} />
            </VideoFormSection>

            <VideoFormSection title="标签投放">
              <VideoTextField name="tags" label="视频标签" value={parseValueList(values.tags).join("，")} help="用于居民端展示和推荐排序，可输入自定义标签。" />
              <VideoSelectField
                name="audienceMatchMode"
                label="用户标签匹配规则"
                value={String(values.audienceMatchMode ?? "NONE")}
                options={[
                  { label: "无标签限制，所有人可见", value: "NONE" },
                  { label: "全部匹配：用户必须拥有所有勾选标签", value: "ALL" },
                  { label: "任一匹配：用户拥有任一勾选标签即可", value: "ANY" },
                  { label: "排除匹配：用户没有任一勾选标签才可见", value: "EXCLUDE" },
                ]}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">勾选用户标签</p>
                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                  {availableAudienceTags.length > 0 ? (
                    availableAudienceTags.map((tag) => (
                      <label key={`${tag.category}-${tag.name}`} className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-sm text-slate-700">
                        <input
                          name="audienceTagOption"
                          type="checkbox"
                          value={tag.name}
                          defaultChecked={audienceTags.includes(tag.name)}
                          className="size-4"
                        />
                        <span className="min-w-0 truncate">{tag.name}</span>
                        <span className="ml-auto shrink-0 text-[11px] text-slate-400">{tag.category}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">暂无居民健康标签，可在下方输入自定义投放标签。</p>
                  )}
                </div>
              </div>
              <VideoTextField name="customAudienceTags" label="自定义投放标签" value={customAudienceTags.join("，")} help="多个标签用逗号、顿号或换行分隔。" />
            </VideoFormSection>

            <VideoFormSection title="发布设置">
              <div className="grid gap-3 sm:grid-cols-2">
                <VideoSelectField
                  name="status"
                  label="状态"
                  value={String(values.status ?? "PENDING_REVIEW")}
                  options={[{ label: "草稿", value: "DRAFT" }, { label: "待审核", value: "PENDING_REVIEW" }, { label: "已发布", value: "PUBLISHED" }, { label: "已下架", value: "ARCHIVED" }]}
                />
                <VideoTextField name="priority" label="优先级" value={values.priority ?? 50} />
              </div>
              <VideoTextField name="publishedAt" label="发布时间" value={values.publishedAt} />
              <div className="grid gap-3 sm:grid-cols-2">
                <VideoTextField name="publishStartAt" label="投放开始时间" value={values.publishStartAt} />
                <VideoTextField name="publishEndAt" label="投放结束时间" value={values.publishEndAt} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <VideoCheckboxField name="isHomeRecommended" label="首页推荐" value={values.isHomeRecommended ?? true} />
                <VideoCheckboxField name="isPinned" label="置顶" value={values.isPinned} />
              </div>
            </VideoFormSection>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
            {error ? <p className="text-sm text-rose-600">{error}</p> : <p className="text-sm text-slate-400">保存后推荐规则立即生效。</p>}
            <Button type="submit"><Save className="size-4" />保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VideoFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {children}
    </section>
  )
}

function VideoTextField({ name, label, value, help }: { name: string; label: string; value: unknown; help?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <Input name={name} defaultValue={String(value ?? "")} className="h-9" />
      {help ? <span className="text-xs text-slate-400">{help}</span> : null}
    </label>
  )
}

function VideoTextareaField({ name, label, value, rows, help }: { name: string; label: string; value: unknown; rows: number; help?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <Textarea name={name} defaultValue={String(value ?? "")} rows={rows} />
      {help ? <span className="text-xs text-slate-400">{help}</span> : null}
    </label>
  )
}

function VideoSelectField({
  name,
  label,
  value,
  options,
}: {
  name: string
  label: string
  value: string
  options: Array<{ label: string; value: string }>
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select name={name} defaultValue={value} className="h-9 rounded-md border border-slate-200 px-2 text-sm">
        {options.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  )
}

function VideoCheckboxField({ name, label, value }: { name: string; label: string; value: unknown }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
      <input name={name} type="checkbox" defaultChecked={Boolean(value)} className="size-4" />
      {label}
    </label>
  )
}

function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const defaultValue = field.type === "json" ? parseJsonArray(String(value ?? "[]")).join("，") : String(value ?? "")
  if (field.type === "textarea") return <Textarea name={field.name} defaultValue={defaultValue} rows={4} />
  if (field.type === "select") return <select name={field.name} defaultValue={defaultValue} className="h-9 rounded-md border border-slate-200 px-2 text-sm">{field.options?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
  if (field.type === "boolean") return <input name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="size-4" />
  return <Input name={field.name} defaultValue={defaultValue} />
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>
}

const institutionFields: Field[] = [
  { name: "name", label: "名称" },
  { name: "type", label: "类型", type: "select", options: [{ label: "三甲医院", value: "TERTIARY_HOSPITAL" }, { label: "社区卫生服务中心", value: "COMMUNITY_HEALTH_CENTER" }] },
  { name: "level", label: "等级" },
  { name: "address", label: "地址" },
  { name: "capabilities", label: "服务能力", type: "json" },
  { name: "description", label: "简介", type: "textarea" },
]

function departmentFields(institutions: Institution[]): Field[] {
  return [
    { name: "institutionId", label: "所属机构", type: "select", options: institutions.map((item) => ({ label: item.name, value: item.id })) },
    { name: "name", label: "科室名称" },
    { name: "description", label: "简介", type: "textarea" },
    { name: "symptomKeywords", label: "症状关键词", type: "json" },
    { name: "diseaseKeywords", label: "疾病关键词", type: "json" },
  ]
}

function doctorFields(institutions: Institution[], departments: Department[]): Field[] {
  return [
    { name: "institutionId", label: "所属机构", type: "select", options: institutions.map((item) => ({ label: item.name, value: item.id })) },
    { name: "departmentId", label: "所属科室", type: "select", options: departments.map((item) => ({ label: `${item.institution?.name ?? ""} / ${item.name}`, value: item.id })) },
    { name: "name", label: "姓名" },
    { name: "title", label: "职称" },
    { name: "specialties", label: "擅长方向", type: "json" },
    { name: "isExpert", label: "是否专家池", type: "boolean" },
    { name: "introduction", label: "简介", type: "textarea" },
  ]
}

const ruleFields: Field[] = [
  { name: "name", label: "ruleName" },
  { name: "symptomKeywords", label: "conditions：症状关键词", type: "json" },
  { name: "riskFactors", label: "conditions：风险因素", type: "json" },
  { name: "triageLevel", label: "triageLevel", type: "select", options: ["P0", "P1", "P2", "P3", "P4"].map((item) => ({ label: item, value: item })) },
  { name: "suggestedDepartment", label: "suggestedDepartment" },
  { name: "suggestedCareType", label: "suggestedAction" },
  { name: "explanation", label: "说明", type: "textarea" },
  { name: "enabled", label: "enabled", type: "boolean" },
]

const knowledgeFields: Field[] = [
  { name: "title", label: "标题" },
  { name: "category", label: "文档类型", type: "select", options: ["医学指南", "临床路径", "医院服务知识", "医生知识", "分诊规则", "健康科普"].map((item) => ({ label: item, value: item })) },
  { name: "source", label: "来源" },
  { name: "tags", label: "标签", type: "json" },
  { name: "content", label: "内容", type: "textarea" },
]

type LocalVideoMetadata = {
  width: number
  height: number
  duration: number
}

function readLocalVideoMetadata(file: File): Promise<LocalVideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)

    video.preload = "metadata"
    video.muted = true
    video.playsInline = true
    video.onloadedmetadata = () => {
      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      }
      URL.revokeObjectURL(url)

      if (!metadata.width || !metadata.height || !Number.isFinite(metadata.duration)) {
        reject(new Error("无法读取视频信息，请更换 mp4 文件"))
        return
      }

      resolve(metadata)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("无法读取视频信息，请更换 mp4 文件"))
    }
    video.src = url
  })
}

function captureVideoFrame(file: File, frameMode: CoverFrameMode, duration: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)

    video.preload = "auto"
    video.muted = true
    video.playsInline = true
    video.onloadedmetadata = () => {
      video.currentTime = frameMode === "LAST" ? Math.max(0, duration - 0.08) : Math.min(0.08, duration)
    }
    video.onseeked = () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext("2d")

      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error("封面生成失败，请重新选择视频"))
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)

          if (!blob) {
            reject(new Error("封面生成失败，请重新选择视频"))
            return
          }

          resolve(new File([blob], "cover.jpg", { type: "image/jpeg" }))
        },
        "image/jpeg",
        0.88
      )
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("封面生成失败，请重新选择视频"))
    }
    video.src = url
  })
}

function formatSeconds(seconds: number) {
  const value = Math.max(1, Math.round(seconds))
  const minutes = Math.floor(value / 60)
  const remainingSeconds = value % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function escapeCssUrl(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "%22")
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "草稿",
    PENDING_REVIEW: "待审核",
    PUBLISHED: "已发布",
    ARCHIVED: "已下架",
  }

  return labels[status] ?? status
}

function audienceRuleLabel(mode: string, audienceTags: string[]) {
  if (mode === "NONE" || audienceTags.length === 0) {
    return "无标签限制，所有人可见"
  }

  const prefix: Record<string, string> = {
    ALL: "全部匹配",
    ANY: "任一匹配",
    EXCLUDE: "排除匹配",
  }

  return `${prefix[mode] ?? mode}：${audienceTags.join("、")}`
}

function parseValueList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }

  return parseListInput(String(value ?? ""))
}

function parseListInput(value: string) {
  return value
    .split(/[，,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function toInputDate(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString()
}
