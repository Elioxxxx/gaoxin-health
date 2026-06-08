export const demoScenarios = [
  {
    key: "chest_pain_high_risk",
    resident: "张建国",
    title: "胸闷胸痛，高风险分诊",
    input: "我胸口有点闷，还有轻微胸痛，大概两个小时了，以前有高血压。",
    description: "66岁男性，既往高血压，演示 P0/P1 高风险和三甲专家推荐。",
  },
  {
    key: "hypertension_followup",
    resident: "李秀兰",
    title: "高血压复诊，社区承接",
    input: "我有高血压，最近想复诊开药。",
    description: "58岁女性，高血压稳定复诊，演示社区卫生服务中心和家庭医生承接。",
  },
  {
    key: "child_fever",
    resident: "王小宝",
    title: "儿童发热，儿科推荐",
    input: "孩子 5 岁，发热一天，目前没有抽搐。",
    description: "5岁儿童发热，演示 P2 分诊和儿科/综合医院推荐。",
  },
  {
    key: "high_glucose_exam",
    resident: "陈明",
    title: "体检血糖偏高，慢病管理",
    input: "体检发现血糖偏高，想知道该去哪看。",
    description: "42岁男性体检异常，演示慢病管理或内分泌门诊推荐。",
  },
] as const
