import { LeadStatus, UserActionEventType } from "@/generated/prisma/client"
import { z } from "zod"

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
