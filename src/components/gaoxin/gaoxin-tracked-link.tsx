"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import { trackUserAction } from "@/lib/intent/client-action"

export function GaoxinTrackedLink({
  href,
  className,
  children,
  eventType,
  eventName,
  content,
  targetType,
  targetId,
  metadata,
}: {
  href: string
  className?: string
  children: ReactNode
  eventType: string
  eventName: string
  content?: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackUserAction({
          eventType,
          eventName,
          content,
          targetType,
          targetId,
          metadata,
        })
      }
    >
      {children}
    </Link>
  )
}
