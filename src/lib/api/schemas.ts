import {
  InstitutionType,
  LeadStatus,
  TriageLevel,
  UserActionEventType,
} from "@/generated/prisma/client"
import { z } from "zod"

const shortText = z.string().trim().min(1).max(120)
const mediumText = z.string().trim().min(1).max(500)
const longText = z.string().trim().max(10000)
const optionalJson = z.unknown().optional()

export const createPreConsultSessionSchema = z.object({
  residentId: z.string().min(1).optional(),
  initialInput: z.string().trim().min(1, "initialInput 不能为空").max(2000),
  scenarioKey: z.string().min(1).max(80).optional(),
})

export const createPreConsultMessageSchema = z.object({
  content: z.string().trim().min(1, "content 不能为空").max(4000),
  role: z.enum(["USER", "ASSISTANT"]).optional(),
})

export const logUserActionSchema = z.object({
  residentId: z.string().min(1).optional(),
  eventType: z.enum(UserActionEventType).or(z.string().min(1).max(80)),
  eventName: z.string().min(1).max(120),
  pagePath: z.string().max(300).optional(),
  content: z.string().max(2000).optional(),
  targetType: z.string().max(80).optional(),
  targetId: z.string().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const analyzeResidentIntentSchema = z.object({
  residentId: z.string().min(1),
})

export const updateServiceLeadSchema = z.object({
  status: z.enum(LeadStatus),
})

export const institutionCreateSchema = z.object({
  name: shortText,
  type: z.enum(InstitutionType),
  level: z.string().trim().min(1).max(80).optional(),
  address: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  capabilities: optionalJson,
})

export const institutionUpdateSchema = institutionCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少需要提供一个要更新的字段"
)

export const departmentCreateSchema = z.object({
  institutionId: z.string().min(1),
  name: shortText,
  description: z.string().trim().max(1000).optional(),
  symptomKeywords: optionalJson,
  diseaseKeywords: optionalJson,
})

export const departmentUpdateSchema = departmentCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少需要提供一个要更新的字段"
)

export const doctorCreateSchema = z.object({
  institutionId: z.string().min(1),
  departmentId: z.string().min(1),
  name: shortText,
  title: z.string().trim().min(1).max(80).optional(),
  specialties: optionalJson,
  isExpert: z.boolean().optional(),
  introduction: z.string().trim().max(2000).optional(),
})

export const doctorUpdateSchema = doctorCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少需要提供一个要更新的字段"
)

export const triageRuleCreateSchema = z.object({
  name: shortText,
  priority: z.coerce.number().int().min(0).max(1000).optional(),
  enabled: z.boolean().optional(),
  symptomKeywords: optionalJson,
  riskFactors: optionalJson,
  triageLevel: z.enum(TriageLevel).optional(),
  suggestedDepartment: z.string().trim().min(1).max(120).optional(),
  suggestedCareType: z.string().trim().min(1).max(120).optional(),
  explanation: z.string().trim().max(1000).optional(),
})

export const triageRuleUpdateSchema = triageRuleCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少需要提供一个要更新的字段"
)

export const knowledgeDocumentCreateSchema = z.object({
  title: shortText,
  category: z.string().trim().min(1).max(80).optional(),
  source: z.string().trim().min(1).max(120).optional(),
  content: longText.optional(),
  tags: optionalJson,
})

export const knowledgeDocumentUpdateSchema = knowledgeDocumentCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "至少需要提供一个要更新的字段")

export const qualityIssueUpdateSchema = z.object({
  status: z.enum(["OPEN", "REVIEWING", "RESOLVED"]),
})

export const doctorFeedbackSchema = z.object({
  sessionId: z.string().min(1, "缺少预问诊会话 ID"),
  runId: z.string().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: mediumText.optional(),
  triageAccuracy: z.string().trim().max(40).optional(),
  departmentAccuracy: z.string().trim().max(40).optional(),
  summaryHelpful: z.string().trim().max(40).optional(),
  needMoreInfo: z.boolean().optional(),
  actualResult: z.string().trim().max(500).optional(),
  remark: z.string().trim().max(1000).optional(),
})

export const serviceLeadFeedbackSchema = z.object({
  status: z.enum(LeadStatus).optional(),
  operatorRole: z.string().trim().min(1).max(80).optional(),
  operatorName: z.string().trim().min(1).max(80).optional(),
  feedbackType: z.string().trim().min(1).max(80).optional(),
  comment: z.string().trim().max(1000).optional(),
})
