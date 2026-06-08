import {
  IntentType,
  InstitutionType,
  LeadReceiverType,
  LeadType,
  type Department,
  type Institution,
  type ResidentProfile,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import type { IntentRuleMatch } from "@/lib/intent/intent-rules"

export type LeadRoute = {
  receiverType: LeadReceiverType
  receiverInstitutionId?: string
  receiverDepartmentId?: string
  leadType: LeadType
}

export async function routeLeadForIntent(
  resident: ResidentProfile,
  match: IntentRuleMatch
): Promise<LeadRoute> {
  const receiverType = refineReceiverType(match)

  if (receiverType === LeadReceiverType.HEALTH_COMMISSION) {
    return { receiverType, leadType: match.leadType }
  }

  const target =
    receiverType === LeadReceiverType.HOSPITAL
      ? await findHospitalTarget(match)
      : await findCommunityTarget(resident, match)

  return {
    receiverType,
    receiverInstitutionId: target?.institution.id,
    receiverDepartmentId: target?.department?.id,
    leadType: match.leadType,
  }
}

function refineReceiverType(match: IntentRuleMatch) {
  const hospitalIntents = new Set<IntentType>([
    IntentType.ACUTE_CARE_INTENT,
    IntentType.SPECIALTY_CARE_INTENT,
    IntentType.SERVICE_DROPOFF,
  ])
  if (hospitalIntents.has(match.intentType)) {
    return LeadReceiverType.HOSPITAL
  }

  const communityIntents = new Set<IntentType>([
    IntentType.CHRONIC_DISEASE_MANAGEMENT,
    IntentType.FAMILY_DOCTOR_SIGNUP,
    IntentType.ELDERLY_HEALTH,
    IntentType.PUBLIC_HEALTH_FOLLOWUP,
  ])
  if (communityIntents.has(match.intentType)) {
    return LeadReceiverType.COMMUNITY_HEALTH_CENTER
  }

  if (match.intentType === IntentType.HEALTH_ANXIETY) {
    return LeadReceiverType.HEALTH_COMMISSION
  }

  return match.receiverType
}

async function findHospitalTarget(match: IntentRuleMatch) {
  const departmentKeyword = resolveDepartmentKeyword(match)
  const hospital = await prisma.institution.findFirst({
    where: {
      type: InstitutionType.TERTIARY_HOSPITAL,
      departments: {
        some: { name: { contains: departmentKeyword } },
      },
    },
    orderBy: { name: "asc" },
    include: {
      departments: { where: { name: { contains: departmentKeyword } }, take: 1 },
    },
  })

  if (hospital) {
    return normalizeTarget(hospital)
  }

  const fallback = await prisma.institution.findFirst({
    where: { name: { contains: "成都市第一人民医院" } },
    include: { departments: { take: 1 } },
  })

  return fallback ? normalizeTarget(fallback) : null
}

async function findCommunityTarget(resident: ResidentProfile, match: IntentRuleMatch) {
  const communityPrefix = resident.community.replace("社区", "")
  const departmentKeyword = match.leadType === LeadType.CHILD_CARE ? "儿童保健" : "慢病管理"
  const community = await prisma.institution.findFirst({
    where: {
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      OR: [
        { name: { contains: communityPrefix } },
        { address: { contains: communityPrefix } },
      ],
    },
    include: {
      departments: {
        where: { name: { contains: departmentKeyword } },
        take: 1,
      },
    },
  })

  if (community) {
    return normalizeTarget(community)
  }

  const fallback = await prisma.institution.findFirst({
    where: { name: { contains: "桂溪社区卫生服务中心" } },
    include: { departments: { where: { name: { contains: departmentKeyword } }, take: 1 } },
  })

  return fallback ? normalizeTarget(fallback) : null
}

function resolveDepartmentKeyword(match: IntentRuleMatch) {
  if (match.leadType === LeadType.CHILD_CARE) {
    return "儿科"
  }

  if (match.leadType === LeadType.MATERNAL_CARE) {
    return "儿科"
  }

  if (match.leadType === LeadType.REPORT_REVIEW) {
    return match.matchedKeywords.some((keyword) => keyword.includes("结节")) ? "内分泌科" : "消化内科"
  }

  if (match.leadType === LeadType.MEDICATION_SAFETY) {
    return "呼吸内科"
  }

  return "心血管内科"
}

function normalizeTarget<T extends Institution & { departments: Department[] }>(target: T) {
  return {
    institution: target,
    department: target.departments[0],
  }
}
