import { addDays } from "@/lib/date"

import { runLoggedAgent } from "./logging"
import type { HealthSummaryAgentOutput, HealthTaskDraft, TriageAgentOutput } from "./types"

export async function runFollowUpAgent(input: {
  sessionId?: string
  triage: TriageAgentOutput
  healthSummary: HealthSummaryAgentOutput
}) {
  return runLoggedAgent({
    agentName: "follow_up_agent",
    sessionId: input.sessionId,
    input,
    handler: (): HealthTaskDraft[] => {
      const text = `${input.triage.suggestedDepartment} ${input.healthSummary.riskTags.join(" ")}`
      const tasks: HealthTaskDraft[] = []

      if (text.includes("高血压")) {
        tasks.push({
          title: "连续记录家庭血压",
          type: "血压记录",
          status: "待处理",
          dueDate: addDays(7),
          description: "连续7天记录早晚血压，并在复诊时给医生查看。",
        })
        tasks.push({
          title: "高血压复诊提醒",
          type: "复诊提醒",
          status: "待处理",
          dueDate: addDays(30),
          description: "根据血压控制情况进行社区慢病复诊。",
        })
      }

      if (text.includes("血糖") || text.includes("内分泌")) {
        tasks.push({
          title: "复查空腹血糖和糖化血红蛋白",
          type: "血糖复查",
          status: "待处理",
          dueDate: addDays(14),
          description: "完成复查后评估是否需要内分泌专科就诊。",
        })
        tasks.push({
          title: "饮食运动干预",
          type: "健康建议",
          status: "待处理",
          dueDate: addDays(1),
          description: "减少含糖饮料和高油高糖饮食，每周保持规律运动。",
        })
      }

      if (text.includes("儿科") || text.includes("儿童")) {
        tasks.push({
          title: "儿童发热症状观察",
          type: "症状观察",
          status: "待处理",
          dueDate: addDays(1),
          description: "观察体温、精神状态、进食饮水和尿量变化。",
        })
      }

      if (text.includes("胸痛") || text.includes("心血管")) {
        tasks.push({
          title: "胸痛就诊后随访",
          type: "急症随访",
          status: "待处理",
          dueDate: addDays(3),
          description: "就诊后补充检查结果和医生诊断，便于后续健康管理。",
        })
      }

      return tasks.length > 0 ? tasks : []
    },
  })
}
