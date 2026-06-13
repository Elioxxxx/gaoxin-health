import { fail, getRouteParams, ok, type RouteContext } from "@/lib/api/response"
import { getDoctorHealthProfilePayload } from "@/server/queries/doctor-query"

export async function GET(_request: Request, context: RouteContext<{ id: string }>) {
  const { id } = await getRouteParams(context)
  const patient = await getDoctorHealthProfilePayload(id)

  if (!patient) {
    return fail("not_found", "患者不存在", 404)
  }

  return ok({
    resident: patient,
    doctorHealthProfile: patient.doctorProfiles[0] ?? null,
    riskFocusItems: patient.doctorProfiles[0]?.riskFocusItems ?? [],
    medicalRecords: patient.medicalRecords,
    diagnoses: patient.diagnoses,
    medications: patient.medications,
    labResults: patient.labResults,
    allergies: patient.allergies,
    userActionEvents: patient.userActionEvents,
    intentInsights: patient.intentInsights,
    serviceLeads: patient.serviceLeads,
  })
}
