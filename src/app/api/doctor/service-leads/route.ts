import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"
import {
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
} from "@/generated/prisma/client"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const receiverType = enumValue(LeadReceiverType, url.searchParams.get("receiverType"))
  const leadType = enumValue(LeadType, url.searchParams.get("leadType"))
  const status = enumValue(LeadStatus, url.searchParams.get("status"))
  const priority = enumValue(LeadPriority, url.searchParams.get("priority"))

  const leads = await prisma.serviceLead.findMany({
    where: {
      receiverType,
      leadType,
      status,
      priority,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      resident: {
        include: {
          healthTags: true,
          userActionEvents: {
            orderBy: { occurredAt: "desc" },
            take: 3,
          },
        },
      },
      intentInsight: true,
      receiverInstitution: true,
      receiverDepartment: true,
      feedback: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  })

  return ok({ leads })
}

function enumValue<T extends Record<string, string>>(values: T, value: string | null) {
  return value && Object.values(values).includes(value) ? (value as T[keyof T]) : undefined
}
