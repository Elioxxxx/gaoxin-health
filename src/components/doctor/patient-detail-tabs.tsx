"use client"

import { useState } from "react"
import { CheckCircle2, SendHorizonal } from "lucide-react"

import { CrossInstitutionTimeline } from "@/components/doctor/cross-institution-timeline"
import { DoctorHealthProfilePanel } from "@/components/doctor/doctor-health-profile-panel"
import { DoctorTriageBadge } from "@/components/doctor/doctor-badges"
import { IntentAnalysisPanel } from "@/components/doctor/intent-analysis-panel"
import { LabTrendPanel } from "@/components/doctor/lab-trend-panel"
import { MedicationSafetyPanel } from "@/components/doctor/medication-safety-panel"
import { RiskFocusPanel } from "@/components/doctor/risk-focus-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parseJsonArray, parseJsonObject } from "@/lib/json"

type PatientDetail = {
  id: string
  name: string
  age: number
  gender: string
  healthTags: Array<{ id: string; name: string }>
  healthSummaries: Array<{ summaryText: string; summaryJson: string }>
  diagnoses: Array<{ id: string; name: string; status: string; notes?: string | null }>
  medications: Array<{ id: string; name: string; dosage: string; frequency: string }>
  allergies: Array<{ id: string; allergen: string; reaction: string; severity: string }>
  labResults: Array<{ id: string; itemName: string; value: string; unit?: string | null; abnormalFlag?: string | null; resultDate?: string; referenceRange?: string | null }>
  doctorProfiles: Array<{
    id: string
    generatedAt: string
    summaryTitle: string
    onePageSummary: string
    majorProblemsJson: string
    currentVisitRelevanceJson: string
    sourceRecordsJson: string
    doctorChecklistJson: string
    riskFocusItems: Array<{
      id: string
      category: string
      title: string
      summary: string
      evidenceJson: string
      suggestedDoctorAction: string
      priority: string
    }>
  }>
  userActionEvents: Array<{
    id: string
    eventType: string
    eventName: string
    pagePath: string
    content?: string | null
    occurredAt: string
  }>
  intentInsights: Array<{
    id: string
    intentType: string
    title: string
    summary: string
    confidence: number
    evidenceEventsJson: string
    suggestedAction: string
    priority: string
    status: string
  }>
  serviceLeads: Array<{
    id: string
    leadType: string
    receiverType: string
    title: string
    summary: string
    suggestedAction: string
    priority: string
    status: string
  }>
  medicalRecords: Array<{
    id: string
    institutionName: string
    departmentName: string
    visitDate: string
    chiefComplaint: string
    diagnosisText: string
    treatmentText: string
    sourceType: string
  }>
  sessions: Array<{
    id: string
    initialInput: string
    scenarioKey: string
    messages: Array<{ id: string; role: string; content: string }>
    report?: {
      chiefComplaint: string
      presentIllness: string
      pastHistory: string
      medicationHistory: string
      allergyHistory: string
      riskFlags: string
      doctorSummary: string
      structuredJson: string
    } | null
    triageResult?: {
      level: string
      suggestedDepartment: string
      suggestedCareType: string
      reasons: string
      confidence: number
    } | null
      recommendations: Array<{
      id: string
      score: number
      reasons: string
      institution: { name: string }
      department: { name: string }
      doctor?: { name: string; title: string } | null
      guidePlans?: Array<{ id: string; title: string; navigationText: string }>
    }>
    guidePlans: Array<{ id: string; title: string; navigationText: string }>
    agentRuns: Array<{ id: string; agentName: string; inputJson: string; outputJson: string; status: string }>
  }>
}

const feedbackOptions = ["准确", "不准确", "不确定"] as const
const summaryOptions = ["有帮助", "一般", "无帮助"] as const

export function PatientDetailTabs({ patient }: { patient: PatientDetail }) {
  const session = patient.sessions[0]
  const report = session?.report
  const triage = session?.triageResult
  const recommendation = session?.recommendations[0]
  const [triageAccuracy, setTriageAccuracy] = useState("准确")
  const [departmentAccuracy, setDepartmentAccuracy] = useState("准确")
  const [summaryHelpful, setSummaryHelpful] = useState("有帮助")
  const [needMoreInfo, setNeedMoreInfo] = useState(false)
  const [actualResult, setActualResult] = useState("")
  const [remark, setRemark] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!session) {
      return
    }

    setSubmitting(true)
    const response = await fetch(`/api/doctor/patients/${patient.id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        triageAccuracy,
        departmentAccuracy,
        summaryHelpful,
        needMoreInfo,
        actualResult,
        remark,
      }),
    })

    setSubmitting(false)

    if (response.ok) {
      setSubmitted(true)
    }
  }

  const riskFlags = parseJsonArray(report?.riskFlags)
  const structured = parseJsonObject(report?.structuredJson, {
    riskFlags: [],
  })
  const abnormalLabs = patient.labResults.filter(
    (item) => item.abnormalFlag && item.abnormalFlag !== "正常"
  )
  const doctorProfile = patient.doctorProfiles[0]
  const riskFocusItems = doctorProfile?.riskFocusItems ?? []

  return (
    <Tabs defaultValue="doctor-profile" className="gap-4">
      <TabsList className="h-auto w-full flex-wrap justify-start bg-white p-1">
        <TabsTrigger value="doctor-profile">医生版健康档案</TabsTrigger>
        <TabsTrigger value="risk-focus">风险提示与医生关注点</TabsTrigger>
        <TabsTrigger value="report">预问诊报告</TabsTrigger>
        <TabsTrigger value="timeline">跨机构记录</TabsTrigger>
        <TabsTrigger value="labs">检查检验趋势</TabsTrigger>
        <TabsTrigger value="medication">用药与禁忌</TabsTrigger>
        <TabsTrigger value="intent">行为意图分析</TabsTrigger>
        <TabsTrigger value="recommendation">推荐理由</TabsTrigger>
        <TabsTrigger value="feedback">医生反馈</TabsTrigger>
      </TabsList>

      <TabsContent value="doctor-profile" className="space-y-4">
        <DoctorHealthProfilePanel profile={doctorProfile} />
      </TabsContent>

      <TabsContent value="risk-focus" className="space-y-4">
        <RiskFocusPanel items={riskFocusItems} />
      </TabsContent>

      <TabsContent value="report" className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-3">
          <InfoCard title="主诉" value={report?.chiefComplaint ?? "暂无"} />
          <InfoCard title="推荐科室" value={triage?.suggestedDepartment ?? "暂无"} />
          <InfoCard title="系统置信度" value={triage ? `${Math.round(triage.confidence * 100)}%` : "暂无"} />
        </div>
        <StructuredCard
          title="现病史摘要"
          rows={[
            ["现病史", report?.presentIllness ?? "暂无"],
            ["伴随症状", riskFlags.join("、") || "暂无"],
            ["既往史", report?.pastHistory ?? "暂无"],
            ["用药史", report?.medicationHistory ?? "暂无"],
            ["过敏史", report?.allergyHistory ?? "暂无"],
          ]}
        />
        <StructuredCard
          title="风险提示与医生关注点"
          rows={[
            ["风险提示", riskFlags.join("；") || "暂无"],
            ["医生关注点", report?.doctorSummary ?? "暂无"],
            ["结构化字段", JSON.stringify(structured.riskFlags ?? riskFlags)],
          ]}
        />
        <Card className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base">系统追问记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {session?.messages.map((message) => (
              <div key={message.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <span className="font-medium text-slate-900">{message.role}</span>
                <span className="ml-2 text-slate-600">{message.content}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="summary" className="space-y-4">
        <StructuredCard
          title="健康档案结构化摘要"
          rows={[
            ["既往诊断", patient.diagnoses.map((item) => `${item.name}（${item.status}）`).join("、")],
            ["用药记录", patient.medications.map((item) => `${item.name} ${item.dosage} ${item.frequency}`).join("、")],
            ["过敏史", patient.allergies.map((item) => `${item.allergen}：${item.reaction}`).join("、")],
            ["检查检验重点异常", abnormalLabs.map((item) => `${item.itemName}${item.value}${item.unit ?? ""} ${item.abnormalFlag}`).join("、") || "暂无"],
            ["慢病管理记录", patient.healthTags.map((item) => item.name).join("、")],
            ["跨机构记录来源", Array.from(new Set(patient.medicalRecords.map((item) => item.institutionName))).join("、")],
          ]}
        />
        <Card className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base">医生版健康摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-600">
              {patient.healthSummaries[0]?.summaryText ?? "暂无摘要"}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="space-y-3">
        <CrossInstitutionTimeline records={patient.medicalRecords} />
      </TabsContent>

      <TabsContent value="labs" className="space-y-4">
        <LabTrendPanel labs={patient.labResults} />
      </TabsContent>

      <TabsContent value="medication" className="space-y-4">
        <MedicationSafetyPanel medications={patient.medications} allergies={patient.allergies} />
      </TabsContent>

      <TabsContent value="intent" className="space-y-4">
        <IntentAnalysisPanel
          events={patient.userActionEvents}
          insights={patient.intentInsights}
          leads={patient.serviceLeads}
        />
      </TabsContent>

      <TabsContent value="recommendation" className="space-y-4">
        <Card className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              分诊等级 <DoctorTriageBadge level={triage?.level} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow label="推荐科室" value={triage?.suggestedDepartment ?? "暂无"} />
            <InfoRow label="建议就医方式" value={triage?.suggestedCareType ?? "暂无"} />
            <InfoRow
              label="推荐医院/医生"
              value={
                recommendation
                  ? `${recommendation.institution.name} / ${recommendation.doctor?.name ?? "暂不指定医生"}`
                  : "暂无"
              }
            />
            <InfoRow label="推荐分" value={recommendation ? `${recommendation.score}` : "暂无"} />
          </CardContent>
        </Card>
        <StructuredCard
          title="推荐理由与规则命中"
          rows={[
            ["推荐理由", parseJsonArray(recommendation?.reasons).join("；") || "暂无"],
            ["命中的规则", parseJsonArray(triage?.reasons).join("；") || "暂无"],
            ["调用过的 Agent", session?.agentRuns.map((run) => run.agentName).join("、") ?? "暂无"],
            ["关键输入摘要", session?.initialInput ?? "暂无"],
            ["导诊方案", session?.guidePlans.map((guide) => `${guide.title}：${guide.navigationText}`).join("；") ?? "暂无"],
          ]}
        />
        <Card className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base">AgentRuns 明细</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {session?.agentRuns.map((run) => (
              <div key={run.id} className="grid gap-1 rounded-md bg-slate-50 p-3 text-sm md:grid-cols-[180px_1fr_100px]">
                <span className="font-medium text-slate-900">{run.agentName}</span>
                <span className="truncate text-slate-600">{run.status}</span>
                <span className="text-slate-500">{run.id.slice(-6)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedback">
        <Card className="rounded-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base">医生反馈</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup label="分诊是否准确" value={triageAccuracy} onChange={setTriageAccuracy} options={feedbackOptions} />
            <RadioGroup label="推荐科室是否准确" value={departmentAccuracy} onChange={setDepartmentAccuracy} options={feedbackOptions} />
            <RadioGroup label="健康摘要是否有帮助" value={summaryHelpful} onChange={setSummaryHelpful} options={summaryOptions} />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={needMoreInfo}
                onChange={(event) => setNeedMoreInfo(event.target.checked)}
              />
              需要补充信息
            </label>
            <textarea
              value={actualResult}
              onChange={(event) => setActualResult(event.target.value)}
              className="min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm"
              placeholder="实际处理结果"
            />
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              className="min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm"
              placeholder="备注"
            />
            <Button type="button" disabled={submitting} onClick={handleSubmit}>
              <SendHorizonal className="size-4" />
              提交反馈
            </Button>
            {submitted ? (
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" />
                提交成功，工作台统计已更新
              </p>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  )
}

function StructuredCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value || "暂无"} />
        ))}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0 md:grid-cols-[160px_1fr]">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm leading-6 text-slate-800">{value}</span>
    </div>
  )
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ${
              value === option
                ? "bg-sky-700 text-white ring-sky-700"
                : "bg-white text-slate-600 ring-slate-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
