import { InstitutionType, TriageLevel } from "@/generated/prisma/client"
import { parseJsonArray } from "@/lib/json"

import type { ResourceBundle, TriageAgentOutput } from "@/lib/ai/agents/types"

type InstitutionResource = ResourceBundle["institutions"][number]
type DepartmentResource = InstitutionResource["departments"][number]
type DoctorResource = DepartmentResource["doctors"][number]

export function scoreDepartment(department: DepartmentResource, triage: TriageAgentOutput) {
  const target = triage.suggestedDepartment
  const keywords = [
    department.name,
    ...parseJsonArray(department.symptomKeywords),
    ...parseJsonArray(department.diseaseKeywords),
  ]

  if (target.includes(department.name) || department.name.includes(target)) {
    return 100
  }

  if (keywords.some((keyword) => target.includes(keyword) || triage.reasons.join(" ").includes(keyword))) {
    return 82
  }

  if (department.name === "全科") {
    return 65
  }

  return 35
}

export function scoreDoctor(doctor: DoctorResource | undefined, triage: TriageAgentOutput) {
  if (!doctor) {
    return 45
  }

  const specialties = parseJsonArray(doctor.specialties)
  const specialtyMatched = specialties.some((item) =>
    `${triage.suggestedDepartment} ${triage.reasons.join(" ")}`.includes(item)
  )

  return Math.min(100, 55 + (doctor.isExpert ? 30 : 10) + (specialtyMatched ? 15 : 0))
}

export function scoreInstitution(institution: InstitutionResource, triage: TriageAgentOutput) {
  const isHighRisk = triage.level === TriageLevel.P0 || triage.level === TriageLevel.P1
  const isCommunityPreferred = triage.level === TriageLevel.P3 || triage.level === TriageLevel.P4

  if (isHighRisk && institution.type === InstitutionType.TERTIARY_HOSPITAL) {
    return 100
  }

  if (isCommunityPreferred && institution.type === InstitutionType.COMMUNITY_HEALTH_CENTER) {
    return 92
  }

  return institution.type === InstitutionType.TERTIARY_HOSPITAL ? 78 : 70
}

export function scoreConvenience(institution: InstitutionResource, community: string) {
  if (institution.name.includes(community.replace("社区", ""))) {
    return 100
  }

  if (institution.address.includes(community.replace("社区", ""))) {
    return 80
  }

  return institution.type === InstitutionType.COMMUNITY_HEALTH_CENTER ? 70 : 55
}

export function scoreContinuity(institution: InstitutionResource, historicalInstitutionNames: string[]) {
  return historicalInstitutionNames.includes(institution.name) ? 100 : 50
}

export function scorePreference(institution: InstitutionResource, triage: TriageAgentOutput) {
  const isHighRisk = triage.level === TriageLevel.P0 || triage.level === TriageLevel.P1

  return isHighRisk && institution.type === InstitutionType.TERTIARY_HOSPITAL ? 90 : 70
}

export function weightedScore(parts: {
  department: number
  doctor: number
  institution: number
  convenience: number
  continuity: number
  preference: number
}) {
  return (
    parts.department * 0.35 +
    parts.doctor * 0.25 +
    parts.institution * 0.15 +
    parts.convenience * 0.1 +
    parts.continuity * 0.1 +
    parts.preference * 0.05
  )
}
