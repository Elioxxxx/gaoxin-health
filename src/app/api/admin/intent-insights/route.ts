import { ok } from "@/lib/api/response"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [insights, leads, events] = await Promise.all([
    prisma.intentInsight.findMany({
      orderBy: { createdAt: "desc" },
      include: { resident: true },
      take: 200,
    }),
    prisma.serviceLead.findMany({
      orderBy: { createdAt: "desc" },
      include: { resident: true, receiverInstitution: true, receiverDepartment: true },
      take: 200,
    }),
    prisma.userActionEvent.findMany({
      where: { occurredAt: { gte: weekStart } },
      orderBy: { occurredAt: "desc" },
      take: 300,
    }),
  ])

  const stats = {
    insightCount: insights.length,
    leadCount: leads.length,
    eventCount: events.length,
    byIntentType: countBy(insights.map((item) => item.intentType)),
    byLeadReceiver: countBy(leads.map((item) => item.receiverType)),
    hotQuestions: topItems(events.map((item) => item.content).filter(Boolean) as string[]),
  }

  return ok({ insights, leads, stats })
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>(
    (acc, value) => ({ ...acc, [value]: (acc[value] ?? 0) + 1 }),
    {}
  )
}

function topItems(values: string[]) {
  return Object.entries(countBy(values)).sort((a, b) => b[1] - a[1]).slice(0, 10)
}
