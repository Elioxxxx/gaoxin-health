"use client"

type TrackUserActionInput = {
  residentId?: string
  eventType: string
  eventName: string
  pagePath?: string
  content?: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}

export function trackUserAction(input: TrackUserActionInput) {
  const payload = JSON.stringify({
    ...input,
    pagePath: input.pagePath ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined),
  })

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" })
      navigator.sendBeacon("/api/intent/actions", blob)
      return
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/intent/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined)
}
