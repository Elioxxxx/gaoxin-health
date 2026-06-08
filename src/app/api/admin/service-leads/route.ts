import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import { LeadPriority, LeadReceiverType, LeadStatus } from "@/generated/prisma/client"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const receiverType = enumValue(LeadReceiverType, url.searchParams.get("receiverType"))
  const status = enumValue(LeadStatus, url.searchParams.get("status"))
  const priority = enumValue(LeadPriority, url.searchParams.get("priority"))

  const leads = await prisma.serviceLead.findMany({
    where: {
      receiverType,
      status,
      priority,
    },
    orderBy: { createdAt: "desc" },
    include: {
      resident: true,
      intentInsight: true,
      receiverInstitution: true,
      receiverDepartment: true,
      feedback: { orderBy: { createdAt: "desc" } },
    },
  })

  return ok({ leads })
}

function enumValue<T extends Record<string, string>>(values: T, value: string | null) {
  return value && Object.values(values).includes(value) ? (value as T[keyof T]) : undefined
}
