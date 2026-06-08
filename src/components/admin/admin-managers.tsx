"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Plus, Save } from "lucide-react"

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
