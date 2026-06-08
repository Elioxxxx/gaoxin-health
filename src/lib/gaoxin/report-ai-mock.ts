export const reportAiOptions = [
  {
    key: "blood-sugar",
    title: "血糖检查报告",
    summary: "空腹血糖较参考范围偏高，建议结合糖化血红蛋白和既往体检结果综合评估。",
    abnormalItems: ["空腹血糖 7.1 mmol/L 偏高", "糖化血红蛋白 6.4% 临界升高"],
    concerns: ["血糖代谢异常", "建议建立慢病管理任务"],
    department: "内分泌科 / 社区慢病管理",
    recheck: "建议 2-4 周内复查空腹血糖和糖化血红蛋白。",
  },
  {
    key: "blood-lipid",
    title: "血脂检查报告",
    summary: "低密度脂蛋白胆固醇偏高，建议结合血压、血糖和心血管风险进行管理。",
    abnormalItems: ["LDL-C 3.8 mmol/L 偏高", "总胆固醇 5.9 mmol/L 偏高"],
    concerns: ["心血管风险管理", "饮食运动干预"],
    department: "心血管内科 / 全科门诊",
    recheck: "建议 1-3 个月后复查血脂。",
  },
  {
    key: "blood-routine",
    title: "血常规报告",
    summary: "白细胞和中性粒细胞轻度升高，需结合发热、咳嗽等症状判断是否需要就医。",
    abnormalItems: ["白细胞 10.8×10^9/L 轻度升高", "中性粒细胞比例 78% 偏高"],
    concerns: ["感染可能", "关注体温和伴随症状"],
    department: "全科 / 呼吸内科",
    recheck: "如症状持续或加重，建议复查血常规。",
  },
]

export type ReportAiOption = (typeof reportAiOptions)[number]
