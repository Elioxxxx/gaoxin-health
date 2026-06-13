import { ok } from "@/lib/api/response"
import { LeadPriority, LeadReceiverType, LeadStatus } from "@/generated/prisma/client"
import { enumValue } from "@/server/queries/filter-utils"
import { listAdminServiceLeads } from "@/server/queries/admin-query"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const receiverType = enumValue(LeadReceiverType, url.searchParams.get("receiverType"))
  const status = enumValue(LeadStatus, url.searchParams.get("status"))
  const priority = enumValue(LeadPriority, url.searchParams.get("priority"))

  const leads = await listAdminServiceLeads({ receiverType, status, priority })

  return ok({ leads })
}
