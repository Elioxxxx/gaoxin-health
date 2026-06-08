export type UserRole = "RESIDENT" | "DOCTOR" | "ADMIN"

export type InstitutionKind =
  | "TERTIARY_HOSPITAL"
  | "COMMUNITY_HEALTH_CENTER"

export type TriageLevelCode = "P0" | "P1" | "P2" | "P3" | "P4"

export type PreConsultSessionStatus =
  | "DRAFT"
  | "ASKING"
  | "TRIAGED"
  | "RECOMMENDED"
  | "GUIDED"
  | "CLOSED"

export type ResidentScenarioKey =
  | "chest_pain_high_risk"
  | "hypertension_followup"
  | "child_fever"
  | "high_glucose_exam"

export type ResidentProfileView = {
  id: string
  name: string
  gender: string
  age: number
  phone: string
  address: string
  community: string
  familyDoctorName?: string | null
}

export type InstitutionView = {
  id: string
  name: string
  type: InstitutionKind
  level: string
  address: string
  description: string
  capabilities: string[]
}

export type DepartmentView = {
  id: string
  institutionId: string
  name: string
  description: string
  symptomKeywords: string[]
  diseaseKeywords: string[]
}

export type DoctorView = {
  id: string
  institutionId: string
  departmentId: string
  name: string
  title: string
  specialties: string[]
  isExpert: boolean
  introduction: string
}

export type PreConsultReportView = {
  id: string
  sessionId: string
  chiefComplaint: string
  presentIllness: string
  pastHistory: string
  medicationHistory: string
  allergyHistory: string
  riskFlags: string[]
  patientExplanation: string
  doctorSummary: string
}

export type TriageResultView = {
  id: string
  sessionId: string
  level: TriageLevelCode
  suggestedDepartment: string
  suggestedCareType: string
  reasons: string[]
  confidence: number
}

export type RecommendationView = {
  id: string
  sessionId: string
  institutionId: string
  departmentId: string
  doctorId?: string | null
  rank: number
  score: number
  reasons: string[]
}

export type GuidePlanView = {
  id: string
  sessionId: string
  recommendationId?: string | null
  title: string
  steps: string[]
  preparationItems: string[]
  navigationText: string
}

export type AgentRunView = {
  id: string
  sessionId?: string | null
  agentName: string
  inputJson: string
  outputJson: string
  status: "RUNNING" | "SUCCESS" | "FAILED"
  latencyMs: number
  createdAt: Date
}
