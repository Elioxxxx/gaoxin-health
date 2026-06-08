export function getGaoxinRecommendationPath(input: {
  institutionName: string
  doctorIsExpert?: boolean | null
  triageLevel?: string
}) {
  if (input.doctorIsExpert || input.triageLevel === "P0" || input.triageLevel === "P1") {
    return "三甲专科"
  }

  if (input.institutionName.includes("社区卫生服务中心")) {
    return "社区卫生服务中心"
  }

  if (input.triageLevel === "P4") {
    return "健康管理"
  }

  return "普通门诊"
}
