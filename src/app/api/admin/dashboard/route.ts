import { ok } from "@/lib/api/response"
import { getAdminDashboardData } from "@/server/queries/admin-query"

export async function GET() {
  return ok(await getAdminDashboardData())
}
