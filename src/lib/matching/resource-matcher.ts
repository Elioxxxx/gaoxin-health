import { InstitutionType, TriageLevel } from "@/generated/prisma/client"

import type {
  RecommendationDraft,
  ResourceBundle,
  TriageAgentOutput,
} from "@/lib/ai/agents/types"

import {
  scoreContinuity,
  scoreConvenience,
  scoreDepartment,
  scoreDoctor,
  scoreInstitution,
  scorePreference,
  weightedScore,
} from "./recommendation-score"

type RankInput = {
  triage: TriageAgentOutput
  residentCommunity: string
  resources: ResourceBundle
  historicalInstitutionNames: string[]
}

export function rankRecommendations(input: RankInput): RecommendationDraft[] {
  const rows = input.resources.institutions.flatMap((institution) => {
    const preferredInstitution = isPreferredInstitution(institution.type, input.triage.level)

    return institution.departments.map((department) => {
      const bestDoctor = [...department.doctors].sort((a, b) => {
        const doctorDelta = scoreDoctor(b, input.triage) - scoreDoctor(a, input.triage)
        return doctorDelta || Number(b.isExpert) - Number(a.isExpert)
      })[0]
      const parts = {
        department: scoreDepartment(department, input.triage),
        doctor: scoreDoctor(bestDoctor, input.triage),
        institution: scoreInstitution(institution, input.triage),
        convenience: scoreConvenience(institution, input.residentCommunity),
        continuity: scoreContinuity(institution, input.historicalInstitutionNames),
        preference: scorePreference(institution, input.triage),
      }
      const preferenceBoost = preferredInstitution ? 8 : 0

      return {
        institution,
        department,
        doctor: bestDoctor,
        score: weightedScore(parts) + preferenceBoost,
        reasons: generateRecommendationReasons({
          triage: input.triage,
          institutionType: institution.type,
          departmentName: department.name,
          doctorName: bestDoctor?.name,
          doctorIsExpert: bestDoctor?.isExpert ?? false,
          convenience: parts.convenience,
          continuity: parts.continuity,
        }),
      }
    })
  })

  return rows
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((row, index) => ({
      institutionId: row.institution.id,
      departmentId: row.department.id,
      doctorId: row.doctor?.id,
      rank: index + 1,
      score: Math.min(100, Math.round(row.score * 10) / 10),
      reasons: row.reasons,
    }))
}

export function generateRecommendationReasons(input: {
  triage: TriageAgentOutput
  institutionType: InstitutionType
  departmentName: string
  doctorName?: string
  doctorIsExpert: boolean
  convenience: number
  continuity: number
}) {
  const reasons = [
    `${input.departmentName}与${input.triage.suggestedDepartment}匹配`,
  ]

  if (
    (input.triage.level === TriageLevel.P0 || input.triage.level === TriageLevel.P1) &&
    input.institutionType === InstitutionType.TERTIARY_HOSPITAL
  ) {
    reasons.push("P0/P1 高风险场景优先推荐三甲医院")
  }

  if (
    (input.triage.level === TriageLevel.P3 || input.triage.level === TriageLevel.P4) &&
    input.institutionType === InstitutionType.COMMUNITY_HEALTH_CENTER
  ) {
    reasons.push("P3/P4 稳定随访场景优先推荐社区卫生服务中心")
  }

  if (input.doctorName) {
    reasons.push(input.doctorIsExpert ? `${input.doctorName}属于专家池医生` : `${input.doctorName}可提供匹配服务`)
  }

  if (input.convenience >= 80) {
    reasons.push("与居民所在社区或片区便利性较高")
  }

  if (input.continuity >= 80) {
    reasons.push("与既往就诊机构具备连续性")
  }

  return reasons
}

function isPreferredInstitution(type: InstitutionType, level: TriageLevel) {
  if (level === TriageLevel.P0 || level === TriageLevel.P1) {
    return type === InstitutionType.TERTIARY_HOSPITAL
  }

  if (level === TriageLevel.P3 || level === TriageLevel.P4) {
    return type === InstitutionType.COMMUNITY_HEALTH_CENTER
  }

  return true
}
