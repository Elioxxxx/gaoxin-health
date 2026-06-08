import { runLoggedAgent } from "./logging"
import type { GuidePlanDraft, RecommendationDraft } from "./types"

export async function runGuideAgent(input: {
  sessionId?: string
  recommendations: RecommendationDraft[]
  institutionNamesById: Record<string, string>
  departmentNamesById: Record<string, string>
}) {
  return runLoggedAgent({
    agentName: "guide_agent",
    sessionId: input.sessionId,
    input,
    handler: (): GuidePlanDraft[] =>
      input.recommendations.map((recommendation) => {
        const institutionName = input.institutionNamesById[recommendation.institutionId]
        const departmentName = input.departmentNamesById[recommendation.departmentId]

        return {
          recommendationId: undefined,
          title: `${departmentName}导诊指引`,
          steps: [
            "携带身份证、既往检查资料和用药清单",
            "按推荐科室挂号",
            "到院后先完成分诊/签到",
            "就诊后根据医生建议检查或复诊",
            "后续可在健康管理中查看随访任务",
          ],
          preparationItems: ["身份证或医保凭证", "既往检查资料", "当前用药清单", "过敏史记录"],
          navigationText: `建议前往${institutionName}${departmentName}，到院后按现场标识完成分诊或签到。`,
        }
      }),
  })
}
