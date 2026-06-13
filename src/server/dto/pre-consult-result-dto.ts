import type { getPreConsultResult } from "@/lib/pre-consult"

import {
  getRecommendationDisplayTag,
  getRecommendationReasonTags,
  getResidentCareAdvice,
  sanitizeResidentRecommendationReasons,
} from "@/lib/gaoxin/display-mappers"
import { parseJsonArray, parseJsonObject } from "@/lib/json"

type PreConsultResult = NonNullable<Awaited<ReturnType<typeof getPreConsultResult>>>

export function toResidentPreConsultResult(result: PreConsultResult) {
  const triage = result.triageResult
  const careAdvice = getResidentCareAdvice(triage?.level ?? "P4")

  return {
    session: {
      id: result.id,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      initialInput: result.initialInput,
    },
    resident: {
      id: result.resident.id,
      name: result.resident.name,
      gender: result.resident.gender,
      age: result.resident.age,
      community: result.resident.community,
      familyDoctorName: result.resident.familyDoctorName,
    },
    careAdvice: {
      ...careAdvice,
      suggestedDepartment: triage?.suggestedDepartment ?? "全科",
      suggestedCareType: triage?.suggestedCareType ?? careAdvice.title,
    },
    report: result.report
      ? {
          chiefComplaint: result.report.chiefComplaint,
          presentIllness: result.report.presentIllness,
          pastHistory: result.report.pastHistory,
          medicationHistory: result.report.medicationHistory,
          allergyHistory: result.report.allergyHistory,
          patientExplanation: result.report.patientExplanation,
          riskFlags: parseJsonArray(result.report.riskFlags),
          structuredJson: parseJsonObject(result.report.structuredJson, {}),
        }
      : null,
    recommendations: result.recommendations.map((recommendation) => ({
      id: recommendation.id,
      rank: recommendation.rank,
      displayTag: getRecommendationDisplayTag(recommendation),
      reasonTags: getRecommendationReasonTags(recommendation),
      institution: {
        id: recommendation.institution.id,
        name: recommendation.institution.name,
        type: recommendation.institution.type,
        level: recommendation.institution.level,
        address: recommendation.institution.address,
      },
      department: {
        id: recommendation.department.id,
        name: recommendation.department.name,
      },
      doctor: recommendation.doctor
        ? {
            id: recommendation.doctor.id,
            name: recommendation.doctor.name,
            title: recommendation.doctor.title,
            isExpert: recommendation.doctor.isExpert,
          }
        : null,
      reasons: sanitizeResidentRecommendationReasons(parseJsonArray(recommendation.reasons)),
      guidePlanId:
        result.guidePlans.find((guidePlan) => guidePlan.recommendationId === recommendation.id)
          ?.id ?? null,
    })),
    guidePlans: result.guidePlans.map((guidePlan) => ({
      id: guidePlan.id,
      recommendationId: guidePlan.recommendationId,
      title: guidePlan.title,
      steps: parseJsonArray(guidePlan.steps),
      preparationItems: parseJsonArray(guidePlan.preparationItems),
      navigationText: guidePlan.navigationText,
      createdAt: guidePlan.createdAt,
    })),
    referencedInfo: {
      description: "本次建议参考了您的本次描述、健康档案摘要、既往就诊记录、检查检验记录和社区随访记录。",
      items: ["本次描述", "健康档案摘要", "既往就诊记录", "检查检验记录", "社区随访记录"],
    },
  }
}

export function toProfessionalPreConsultResult(result: PreConsultResult) {
  return {
    ...result,
    professionalContext: {
      triageLevel: result.triageResult?.level ?? null,
      recommendationScores: result.recommendations.map((recommendation) => ({
        recommendationId: recommendation.id,
        rank: recommendation.rank,
        score: recommendation.score,
      })),
      agentRunCount: result.agentRuns.length,
    },
  }
}
