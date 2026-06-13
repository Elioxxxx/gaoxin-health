import { ok } from "@/lib/api/response"
import { getAdminIntentInsightDashboard } from "@/server/queries/admin-query"

export async function GET() {
  return ok(await getAdminIntentInsightDashboard())
}
