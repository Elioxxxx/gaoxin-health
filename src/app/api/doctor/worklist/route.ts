import { ok } from "@/lib/api/response"
import { getDoctorWorklistSessions } from "@/server/queries/doctor-query"

export async function GET() {
  return ok(await getDoctorWorklistSessions())
}
