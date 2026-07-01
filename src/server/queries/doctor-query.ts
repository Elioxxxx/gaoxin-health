import {
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"

export type ServiceLeadFilters = {
  receiverType?: LeadReceiverType
  leadType?: LeadType
  status?: LeadStatus
  priority?: LeadPriority
}

const openLeadStatuses = [LeadStatus.PENDING, LeadStatus.VIEWED]

export async function getDoctorWorkspaceData() {
  const patients = await prisma.residentProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      healthTags: true,
      doctorProfiles: { orderBy: { generatedAt: "desc" }, take: 1 },
      intentInsights: { orderBy: { createdAt: "desc" }, take: 2 },
      serviceLeads: { where: { status: { in: openLeadStatuses } } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          triageResult: true,
          report: true,
          recommendations: {
            orderBy: { rank: "asc" },
            include: {
              institution: true,
              department: true,
              doctor: true,
            },
          },
        },
      },
    },
  })

  const [
    feedbackCount,
    hospitalLeadCount,
    communityLeadCount,
    pendingLeadCount,
  ] = await Promise.all([
    prisma.agentFeedback.count(),
    prisma.serviceLead.count({ where: { receiverType: LeadReceiverType.HOSPITAL } }),
    prisma.serviceLead.count({
      where: { receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER },
    }),
    prisma.serviceLead.count({ where: { status: { in: openLeadStatuses } } }),
  ])

  const highRiskCount = patients.filter((item) =>
    ["P0", "P1"].includes(item.sessions[0]?.triageResult?.level ?? "")
  ).length
  const doctorProfileCount = patients.filter(
    (item) => item.doctorProfiles.length > 0
  ).length

  return {
    patients,
    feedbackCount,
    highRiskCount,
    doctorProfileCount,
    hospitalLeadCount,
    communityLeadCount,
    pendingLeadCount,
  }
}

export async function getDoctorWorklistSessions() {
  const sessions = await prisma.preConsultSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      resident: true,
      report: true,
      triageResult: true,
      recommendations: {
        orderBy: { rank: "asc" },
        include: { institution: true, department: true, doctor: true },
      },
    },
  })

  const priority: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 }

  return [...sessions].sort(
    (a, b) =>
      (priority[a.triageResult?.level ?? "P4"] ?? 9) -
      (priority[b.triageResult?.level ?? "P4"] ?? 9)
  )
}

export function getDoctorScheduleSessions() {
  return prisma.preConsultSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      resident: true,
      triageResult: true,
      recommendations: {
        orderBy: { rank: "asc" },
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      },
    },
  })
}

export function getDoctorReportSessions() {
  return prisma.preConsultSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      resident: {
        include: {
          healthTags: true,
          doctorProfiles: { orderBy: { generatedAt: "desc" }, take: 1 },
        },
      },
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
      feedback: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })
}

export function getDoctorFeedbackRecords() {
  return prisma.agentFeedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      issues: true,
      run: true,
      session: {
        include: {
          resident: true,
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
        },
      },
    },
  })
}

export function listDoctorServiceLeads(filters: ServiceLeadFilters = {}) {
  return prisma.serviceLead.findMany({
    where: {
      receiverType: filters.receiverType,
      leadType: filters.leadType,
      status: filters.status,
      priority: filters.priority,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      resident: {
        include: {
          healthTags: true,
          userActionEvents: {
            orderBy: { occurredAt: "desc" },
            take: 3,
          },
        },
      },
      intentInsight: true,
      receiverInstitution: true,
      receiverDepartment: true,
      feedback: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  })
}

export function getDoctorPatientDetail(id: string) {
  return prisma.residentProfile.findUnique({
    where: { id },
    include: {
      healthTags: true,
      healthSummaries: { orderBy: { createdAt: "desc" } },
      medicalRecords: { orderBy: { visitDate: "desc" } },
      diagnoses: true,
      medications: true,
      allergies: true,
      labResults: true,
      doctorProfiles: {
        orderBy: { generatedAt: "desc" },
        include: { riskFocusItems: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] } },
      },
      userActionEvents: { orderBy: { occurredAt: "desc" } },
      intentInsights: { orderBy: { createdAt: "desc" } },
      serviceLeads: { orderBy: { createdAt: "desc" } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          report: true,
          triageResult: true,
          recommendations: {
            orderBy: { rank: "asc" },
            include: {
              institution: true,
              department: true,
              doctor: true,
              guidePlans: true,
            },
          },
          guidePlans: true,
          agentRuns: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  })
}

export function getDoctorPatientApiDetail(id: string) {
  return prisma.residentProfile.findUnique({
    where: { id },
    include: {
      healthTags: true,
      medicalRecords: {
        orderBy: { visitDate: "desc" },
        include: { diagnoses: true, medications: true, labResults: true },
      },
      diagnoses: true,
      medications: true,
      labResults: true,
      allergies: true,
      healthSummaries: { orderBy: { createdAt: "desc" } },
      doctorProfiles: {
        orderBy: { generatedAt: "desc" },
        include: { riskFocusItems: { orderBy: { createdAt: "asc" } } },
      },
      userActionEvents: { orderBy: { occurredAt: "desc" } },
      intentInsights: { orderBy: { createdAt: "desc" } },
      serviceLeads: { orderBy: { createdAt: "desc" } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        include: {
          report: true,
          triageResult: true,
          recommendations: { include: { institution: true, department: true, doctor: true } },
        },
      },
    },
  })
}

export function getDoctorHealthProfilePayload(id: string) {
  return prisma.residentProfile.findUnique({
    where: { id },
    include: {
      healthTags: true,
      doctorProfiles: {
        orderBy: { generatedAt: "desc" },
        include: { riskFocusItems: { orderBy: { createdAt: "asc" } } },
      },
      medicalRecords: { orderBy: { visitDate: "desc" } },
      diagnoses: true,
      medications: true,
      labResults: true,
      allergies: true,
      userActionEvents: { orderBy: { occurredAt: "desc" } },
      intentInsights: { orderBy: { createdAt: "desc" } },
      serviceLeads: { orderBy: { createdAt: "desc" } },
    },
  })
}

export async function getDoctorIntentAnalysis(id: string) {
  const patient = await prisma.residentProfile.findUnique({
    where: { id },
    select: { id: true, name: true },
  })

  if (!patient) {
    return null
  }

  const [events, insights, serviceLeads] = await Promise.all([
    prisma.userActionEvent.findMany({
      where: { residentId: id },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.intentInsight.findMany({
      where: { residentId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceLead.findMany({
      where: { residentId: id },
      orderBy: { createdAt: "desc" },
      include: {
        receiverInstitution: true,
        receiverDepartment: true,
        feedback: { orderBy: { createdAt: "desc" } },
      },
    }),
  ])

  return { resident: patient, events, insights, serviceLeads }
}
