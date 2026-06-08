import { demoScenarios } from "@/lib/demo-scenarios"

export type GaoxinDemoKey = "chest-pain" | "hypertension" | "child-fever" | "blood-sugar"

export type GaoxinPreConsultDemo = {
  demo: GaoxinDemoKey
  label: string
  input: string
  scenarioKey: (typeof demoScenarios)[number]["key"]
}

export const gaoxinPreConsultDemos: GaoxinPreConsultDemo[] = [
  {
    demo: "chest-pain",
    label: "胸闷胸痛",
    input: demoScenarios[0].input,
    scenarioKey: "chest_pain_high_risk",
  },
  {
    demo: "hypertension",
    label: "高血压复诊",
    input: demoScenarios[1].input,
    scenarioKey: "hypertension_followup",
  },
  {
    demo: "child-fever",
    label: "儿童发热",
    input: demoScenarios[2].input,
    scenarioKey: "child_fever",
  },
  {
    demo: "blood-sugar",
    label: "体检血糖偏高",
    input: demoScenarios[3].input,
    scenarioKey: "high_glucose_exam",
  },
]

export function getGaoxinPreConsultDemo(demo: string | null) {
  return gaoxinPreConsultDemos.find((item) => item.demo === demo)
}

export function getScenarioKeyByInput(input: string) {
  const matched = gaoxinPreConsultDemos.find((item) => item.input === input)
  return matched?.scenarioKey
}

export async function runGaoxinPreConsult(input: {
  content: string
  scenarioKey?: string
}) {
  const session = await postJson<{ data: { id: string } }>("/api/pre-consult/sessions", {
    initialInput: input.content,
    scenarioKey: input.scenarioKey,
  })

  await postJson(`/api/pre-consult/sessions/${session.data.id}/messages`, {
    content: input.content,
  })
  await postJson(`/api/pre-consult/sessions/${session.data.id}/run`, {})

  return session.data.id
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    throw new Error(payload?.error?.message ?? `请求失败：${response.status}`)
  }

  return (await response.json()) as T
}
