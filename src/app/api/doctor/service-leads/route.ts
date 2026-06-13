import { ok } from "@/lib/api/response"
import {
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
} from "@/generated/prisma/client"
import { enumValue } from "@/server/queries/filter-utils"
import { listDoctorServiceLeads } from "@/server/queries/doctor-query"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const receiverType = enumValue(LeadReceiverType, url.searchParams.get("receiverType"))
  const leadType = enumValue(LeadType, url.searchParams.get("leadType"))
  const status = enumValue(LeadStatus, url.searchParams.get("status"))
  const priority = enumValue(LeadPriority, url.searchParams.get("priority"))

  const leads = await listDoctorServiceLeads({
    receiverType,
    leadType,
    status,
    priority,
  })

  return ok({ leads })
}
