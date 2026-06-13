import { MessageRole, SessionStatus } from "@/generated/prisma/client"
import { detectScenario } from "@/lib/ai/scenarios"
import { prisma } from "@/lib/db/prisma"
import { stringifyJson } from "@/lib/json"

import {
  runFollowUpAgent,
  runGuideAgent,
  runHealthSummaryAgent,
  runPreConsultAgent,
  runRecommendationAgent,
  runReportGenerationAgent,
  runTriageAgent,
  type RecommendationDraft,
} from "./agents"

const scenarioResidentNames: Record<string, string> = {
  chest_pain_high_risk: "张建国",
  hypertension_followup: "李秀兰",
  child_fever: "王小宝",
  high_glucose_exam: "陈明",
}

export async function createPreConsultSession(input: {
  residentId?: string
  initialInput: string
  scenarioKey?: string
}) {
  const scenarioKey = input.scenarioKey ?? detectScenario(input.initialInput)
  const scenarioResidentName = scenarioResidentNames[scenarioKey]
  const resident = input.residentId
    ? await prisma.residentProfile.findUnique({ where: { id: input.residentId } })
    : await prisma.residentProfile.findFirst({
        where: scenarioResidentName ? { name: scenarioResidentName } : undefined,
        orderBy: { createdAt: "asc" },
      })

  if (!resident) {
    throw new Error("未找到居民档案")
  }

  const session = await prisma.preConsultSession.create({
    data: {
      residentId: resident.id,
      status: SessionStatus.ASKING,
      initialInput: input.initialInput,
      scenarioKey,
      messages: {
        create: {
          role: MessageRole.USER,
          content: input.initialInput,
          structuredJson: stringifyJson({ source: "resident" }),
        },
      },
    },
    include: { messages: true, resident: true },
  })

  return session
}

export async function runPreConsultSession(sessionId: string) {
  const session = await prisma.preConsultSession.findUnique({
    where: { id: sessionId },
    include: {
      resident: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!session) {
    throw new Error("预问诊会话不存在")
  }

  const messageHistory = session.messages.map((message) => message.content)
  const lastUserInput =
    [...session.messages].reverse().find((message) => message.role === MessageRole.USER)?.content ??
    session.initialInput
  const healthBundle = await loadHealthBundle(session.residentId)
  const preConsult = await runPreConsultAgent({
    sessionId,
    initialInput: lastUserInput,
    messageHistory,
  })
  const healthSummary = await runHealthSummaryAgent({
    sessionId,
    healthBundle,
  })
  const report = await runReportGenerationAgent({
    sessionId,
    initialInput: lastUserInput,
    scenarioKey: preConsult.scenarioKey,
    healthSummary,
    resident: session.resident,
  })
  const triage = await runTriageAgent({
    sessionId,
    scenarioKey: preConsult.scenarioKey,
    residentAge: session.resident.age,
    report,
    initialInput: lastUserInput,
  })
  const resources = {
    institutions: await prisma.institution.findMany({
      include: {
        departments: { include: { doctors: true } },
        doctors: true,
        serviceCapabilities: true,
      },
    }),
  }
  const recommendationDrafts = await runRecommendationAgent({
    sessionId,
    residentId: session.residentId,
    residentCommunity: session.resident.community,
    triage,
    resources,
    historicalInstitutionNames: healthBundle.medicalRecords.map((record) => record.institutionName),
  })
  const nameMaps = buildResourceNameMaps(resources.institutions)
  const guideDrafts = await runGuideAgent({
    sessionId,
    recommendations: recommendationDrafts,
    institutionNamesById: nameMaps.institutions,
    departmentNamesById: nameMaps.departments,
  })
  const taskDrafts = await runFollowUpAgent({
    sessionId,
    triage,
    healthSummary,
  })

  await prisma.guidePlan.deleteMany({ where: { sessionId } })
  await prisma.recommendation.deleteMany({ where: { sessionId } })

  const savedReport = await prisma.preConsultReport.upsert({
    where: { sessionId },
    update: {
      chiefComplaint: report.chiefComplaint,
      presentIllness: report.presentIllness,
      pastHistory: report.pastHistory,
      medicationHistory: report.medicationHistory,
      allergyHistory: report.allergyHistory,
      riskFlags: stringifyJson(report.riskFlags),
      patientExplanation: report.patientExplanation,
      doctorSummary: report.doctorSummary,
      structuredJson: stringifyJson(report.structuredJson),
    },
    create: {
      sessionId,
      chiefComplaint: report.chiefComplaint,
      presentIllness: report.presentIllness,
      pastHistory: report.pastHistory,
      medicationHistory: report.medicationHistory,
      allergyHistory: report.allergyHistory,
      riskFlags: stringifyJson(report.riskFlags),
      patientExplanation: report.patientExplanation,
      doctorSummary: report.doctorSummary,
      structuredJson: stringifyJson(report.structuredJson),
    },
  })

  const savedTriage = await prisma.triageResult.upsert({
    where: { sessionId },
    update: {
      level: triage.level,
      suggestedDepartment: triage.suggestedDepartment,
      suggestedCareType: triage.suggestedCareType,
      reasons: stringifyJson(triage.reasons),
      confidence: triage.confidence,
    },
    create: {
      sessionId,
      level: triage.level,
      suggestedDepartment: triage.suggestedDepartment,
      suggestedCareType: triage.suggestedCareType,
      reasons: stringifyJson(triage.reasons),
      confidence: triage.confidence,
    },
  })

  const savedRecommendations = await saveRecommendations(sessionId, recommendationDrafts)

  const savedGuidePlans = await Promise.all(
    savedRecommendations.map((recommendation, index) => {
      const draft = guideDrafts[index]

      return prisma.guidePlan.create({
        data: {
          sessionId,
          recommendationId: recommendation.id,
          title: draft.title,
          steps: stringifyJson(draft.steps),
          preparationItems: stringifyJson(draft.preparationItems),
          navigationText: draft.navigationText,
        },
      })
    })
  )

  if (taskDrafts.length > 0) {
    await prisma.healthTask.deleteMany({
      where: {
        residentId: session.residentId,
        title: { in: taskDrafts.map((task) => task.title) },
      },
    })
    await prisma.healthTask.createMany({
      data: taskDrafts.map((task) => ({
        residentId: session.residentId,
        title: task.title,
        type: task.type,
        status: task.status,
        dueDate: task.dueDate,
        description: task.description,
      })),
    })
  }

  await prisma.preConsultSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.GUIDED,
      scenarioKey: preConsult.scenarioKey,
    },
  })

  return {
    sessionId,
    preConsult,
    healthSummary,
    report: savedReport,
    triage: savedTriage,
    recommendations: savedRecommendations,
    guidePlans: savedGuidePlans,
    healthTasks: taskDrafts,
  }
}

export async function getPreConsultResult(sessionId: string) {
  return prisma.preConsultSession.findUnique({
    where: { id: sessionId },
    include: {
      resident: true,
      messages: { orderBy: { createdAt: "asc" } },
      report: true,
      triageResult: true,
      recommendations: {
        orderBy: { rank: "asc" },
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      },
      guidePlans: true,
      agentRuns: { orderBy: { createdAt: "desc" } },
    },
  })
}

async function loadHealthBundle(residentId: string) {
  const resident = await prisma.residentProfile.findUniqueOrThrow({
    where: { id: residentId },
  })
  const [
    healthTags,
    medicalRecords,
    diagnoses,
    medications,
    labResults,
    allergies,
  ] = await Promise.all([
    prisma.healthTag.findMany({ where: { residentId } }),
    prisma.medicalRecord.findMany({ where: { residentId }, orderBy: { visitDate: "desc" } }),
    prisma.diagnosis.findMany({ where: { residentId } }),
    prisma.medication.findMany({ where: { residentId } }),
    prisma.labResult.findMany({ where: { residentId } }),
    prisma.allergy.findMany({ where: { residentId } }),
  ])

  return {
    resident,
    healthTags,
    medicalRecords,
    diagnoses,
    medications,
    labResults,
    allergies,
  }
}

function buildResourceNameMaps(resources: Awaited<ReturnType<typeof prisma.institution.findMany>>) {
  const institutions: Record<string, string> = {}
  const departments: Record<string, string> = {}

  for (const institution of resources) {
    institutions[institution.id] = institution.name

    if ("departments" in institution && Array.isArray(institution.departments)) {
      for (const department of institution.departments) {
        departments[department.id] = department.name
      }
    }
  }

  return { institutions, departments }
}

async function saveRecommendations(sessionId: string, drafts: RecommendationDraft[]) {
  const saved = []

  for (const draft of drafts) {
    saved.push(
      await prisma.recommendation.create({
        data: {
          sessionId,
          institutionId: draft.institutionId,
          departmentId: draft.departmentId,
          doctorId: draft.doctorId,
          rank: draft.rank,
          score: draft.score,
          reasons: stringifyJson(draft.reasons),
        },
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      })
    )
  }

  return saved
}
