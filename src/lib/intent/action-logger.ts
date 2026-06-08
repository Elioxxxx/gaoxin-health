import {
  UserActionEventType,
  type UserActionEvent,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"

type LogUserActionInput = {
  residentId?: string
  eventType: UserActionEventType | string
  eventName: string
  pagePath?: string
  content?: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}

const eventTypeValues = new Set(Object.values(UserActionEventType))

export async function logUserAction(input: LogUserActionInput): Promise<UserActionEvent | null> {
  try {
    const residentId = input.residentId || (await getDefaultResidentId())

    if (!residentId) {
      return null
    }

    return await prisma.userActionEvent.create({
      data: {
        residentId,
        eventType: normalizeEventType(input.eventType),
        eventName: input.eventName,
        pagePath: input.pagePath ?? "unknown",
        content: input.content,
        targetType: input.targetType,
        targetId: input.targetId,
        metadataJson: JSON.stringify(input.metadata ?? {}, null, 2),
        occurredAt: new Date(),
      },
    })
  } catch (error) {
    console.warn("[intent] logUserAction failed", error)
    return null
  }
}

async function getDefaultResidentId() {
  const resident =
    (await prisma.residentProfile.findFirst({
      where: { name: "张建国" },
      select: { id: true },
    })) ??
    (await prisma.residentProfile.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    }))

  return resident?.id
}

function normalizeEventType(value: UserActionEventType | string): UserActionEventType {
  return eventTypeValues.has(value as UserActionEventType)
    ? (value as UserActionEventType)
    : UserActionEventType.PAGE_VIEW
}
