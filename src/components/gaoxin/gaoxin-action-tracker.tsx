"use client"

import { useEffect } from "react"

import { trackUserAction } from "@/lib/intent/client-action"

export function GaoxinActionTracker({
  eventType,
  eventName,
  content,
  targetType,
  targetId,
  metadata,
}: {
  eventType: string
  eventName: string
  content?: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  useEffect(() => {
    trackUserAction({ eventType, eventName, content, targetType, targetId, metadata })
  }, [content, eventName, eventType, metadata, targetId, targetType])

  return null
}
