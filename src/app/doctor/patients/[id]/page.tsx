import { notFound } from "next/navigation"

import { PatientDetailTabs } from "@/components/doctor/patient-detail-tabs"
import { DoctorTriageBadge } from "@/components/doctor/doctor-badges"
import { getDoctorPatientDetail } from "@/server/queries/doctor-query"

export default async function DoctorPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await getDoctorPatientDetail(id)

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
