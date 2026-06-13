import { ok } from "@/lib/api/response"
import { listDoctorsForResources } from "@/server/queries/resource-query"

export async function GET() {
  return ok(await listDoctorsForResources())
}
