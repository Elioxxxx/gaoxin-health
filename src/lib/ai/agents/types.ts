import type {
  Allergy,
  Department,
  Diagnosis,
  Doctor,
  HealthTag,
  Institution,
  LabResult,
  MedicalRecord,
  Medication,
  ResidentProfile,
  ServiceCapability,
  TriageLevel,
} from "@/generated/prisma/client"
import type { ScenarioKey } from "@/lib/ai/scenarios"

export type AgentBaseInput = {
  sessionId?: string
}

export type PreConsultAgentOutput = {
  collectedFields: Record<string, unknown>
  followUpQuestions: string[]
  scenarioKey: ScenarioKey
}

export type ResidentHealthBundle = {
  resident: ResidentProfile
  healthTags: HealthTag[]
  medicalRecords: MedicalRecord[]
  diagnoses: Diagnosis[]
  medications: Medication[]
  labResults: LabResult[]
  allergies: Allergy[]
}

export type HealthSummaryAgentOutput = {
  residentSummary: string
  doctorSummary: string
  riskTags: string[]
  structuredJson: Record<string, unknown>
}

export type ReportGenerationInput = AgentBaseInput & {
  initialInput: string
  scenarioKey: ScenarioKey
  healthSummary: HealthSummaryAgentOutput
  resident: ResidentProfile
}

export type ReportGenerationOutput = {
  chiefComplaint: string
  presentIllness: string
  pastHistory: string
  medicationHistory: string
  allergyHistory: string
  riskFlags: string[]
  patientExplanation: string
  doctorSummary: string
  structuredJson: Record<string, unknown>
}

export type TriageAgentOutput = {
  level: TriageLevel
  suggestedDepartment: string
  suggestedCareType: string
  reasons: string[]
  confidence: number
}

export type ResourceBundle = {
  institutions: Array<
    Institution & {
      departments: Array<Department & { doctors: Doctor[] }>
      doctors: Doctor[]
      serviceCapabilities: ServiceCapability[]
    }
  >
}

export type RecommendationDraft = {
  institutionId: string
  departmentId: string
  doctorId?: string
  rank: number
  score: number
  reasons: string[]
}

export type GuidePlanDraft = {
  recommendationId?: string
  title: string
  steps: string[]
  preparationItems: string[]
  navigationText: string
}

export type HealthTaskDraft = {
  title: string
  type: string
  status: string
  dueDate?: Date
  description: string
}

export type QualityIssueDraft = {
  title: string
  description: string
  severity: string
  status: string
}
