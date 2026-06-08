import { notFound } from "next/navigation"

import { PatientDetailTabs } from "@/components/doctor/patient-detail-tabs"
import { DoctorTriageBadge } from "@/components/doctor/doctor-badges"
import { prisma } from "@/lib/db/prisma"

export default async function DoctorPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await prisma.residentProfile.findUnique({
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

  if (!patient) {
    notFound()
  }

  const latestTriage = patient.sessions[0]?.triageResult

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">患者详情</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              {patient.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {patient.age}岁 / {patient.gender} / {patient.community}
            </p>
          </div>
          <DoctorTriageBadge level={latestTriage?.level} />
        </div>
      </section>

      <PatientDetailTabs
        patient={JSON.parse(JSON.stringify(patient)) as Parameters<typeof PatientDetailTabs>[0]["patient"]}
      />
    </div>
  )
}
