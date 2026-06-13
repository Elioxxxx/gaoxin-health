import { json, prisma, TriageLevel } from "./shared"

export async function seedRulesAndKnowledge() {
  await prisma.triageRule.createMany({
    data: [
      {
        name: "胸痛胸闷高危规则",
        priority: 100,
        symptomKeywords: json(["胸痛", "胸闷"]),
        riskFactors: json(["高龄", "高血压", "持续2小时", "出汗", "气短"]),
        triageLevel: TriageLevel.P1,
        suggestedDepartment: "心血管内科",
        suggestedCareType: "三甲医院急诊/胸痛中心",
        explanation: "胸痛胸闷合并高龄和高血压，需优先排查急性冠脉综合征。",
      },
      {
        name: "高血压稳定复诊规则",
        priority: 70,
        symptomKeywords: json(["高血压复诊", "续方", "血压稳定"]),
        riskFactors: json(["无急性症状", "社区签约", "规律服药"]),
        triageLevel: TriageLevel.P3,
        suggestedDepartment: "慢病管理",
        suggestedCareType: "社区卫生服务中心/家庭医生",
        explanation: "稳定慢病复诊优先推荐社区慢病管理。",
      },
      {
        name: "儿童发热规则",
        priority: 80,
        symptomKeywords: json(["儿童发热", "发热1天"]),
        riskFactors: json(["5岁", "儿童", "体温升高"]),
        triageLevel: TriageLevel.P2,
        suggestedDepartment: "儿科",
        suggestedCareType: "儿科门诊或综合医院",
        explanation: "儿童发热需要评估精神状态、持续高热和脱水风险。",
      },
      {
        name: "体检血糖异常规则",
        priority: 50,
        symptomKeywords: json(["血糖偏高", "体检异常"]),
        riskFactors: json(["空腹血糖升高", "糖化血红蛋白临界"]),
        triageLevel: TriageLevel.P3,
        suggestedDepartment: "慢病管理/内分泌科",
        suggestedCareType: "社区慢病管理或内分泌门诊",
        explanation: "体检血糖异常可先复查评估，必要时转内分泌科。",
      },
      {
        name: "咳嗽发热规则",
        priority: 60,
        symptomKeywords: json(["咳嗽", "发热"]),
        riskFactors: json(["持续发热", "咳痰", "气促"]),
        triageLevel: TriageLevel.P2,
        suggestedDepartment: "呼吸内科/全科",
        suggestedCareType: "呼吸内科或社区全科",
        explanation: "咳嗽发热需排查呼吸道感染和肺炎风险。",
      },
      {
        name: "腹痛腹泻规则",
        priority: 60,
        symptomKeywords: json(["腹痛", "腹泻"]),
        riskFactors: json(["脱水", "便血", "持续腹痛"]),
        triageLevel: TriageLevel.P2,
        suggestedDepartment: "消化内科/全科",
        suggestedCareType: "消化内科或社区全科",
        explanation: "腹痛腹泻需评估脱水、感染和急腹症风险。",
      },
    ],
  })

  await prisma.departmentMappingRule.createMany({
    data: [
      {
        name: "胸痛映射心血管内科",
        symptomKeywords: json(["胸痛", "胸闷", "心悸"]),
        diseaseKeywords: json(["冠心病", "高血压", "心绞痛"]),
        departmentName: "心血管内科",
        careType: "三甲专科",
        priority: 100,
      },
      {
        name: "儿童发热映射儿科",
        symptomKeywords: json(["儿童发热", "儿童咳嗽"]),
        diseaseKeywords: json(["上呼吸道感染", "肺炎"]),
        departmentName: "儿科",
        careType: "儿科门诊",
        priority: 90,
      },
      {
        name: "血糖异常映射内分泌和慢病",
        symptomKeywords: json(["血糖偏高", "多饮多尿"]),
        diseaseKeywords: json(["糖尿病", "糖代谢异常"]),
        departmentName: "内分泌科/慢病管理",
        careType: "专科或社区",
        priority: 80,
      },
    ],
  })

  await prisma.matchingRule.createMany({
    data: [
      {
        name: "P0/P1优先三甲专家",
        targetType: "Recommendation",
        conditions: json({ triageLevels: ["P0", "P1"], institutionType: "TERTIARY_HOSPITAL" }),
        weights: json({ emergencyCapability: 0.4, expert: 0.3, distance: 0.2, specialtyMatch: 0.1 }),
        description: "高危分诊优先推荐三甲医院、胸痛中心和专家池。",
      },
      {
        name: "P3/P4优先社区",
        targetType: "Recommendation",
        conditions: json({ triageLevels: ["P3", "P4"], institutionType: "COMMUNITY_HEALTH_CENTER" }),
        weights: json({ communityMatch: 0.35, chronicCapability: 0.35, familyDoctor: 0.2, distance: 0.1 }),
        description: "稳定慢病和健康管理优先推荐社区卫生服务中心。",
      },
    ],
  })

  const documents = [
    ["高血压慢病管理服务说明", "慢病管理", ["高血压", "家庭医生", "复诊"]],
    ["胸痛就医流程说明", "急症导诊", ["胸痛", "胸痛中心", "急诊"]],
    ["儿童发热就医提示", "儿科", ["儿童发热", "退热", "儿科"]],
    ["体检血糖异常健康管理说明", "慢病风险", ["血糖偏高", "糖尿病", "体检"]],
    ["高新区医疗资源服务说明", "医疗资源", ["三甲医院", "社区卫生服务中心", "导诊"]],
  ] as const

  for (const [title, category, tags] of documents) {
    const document = await prisma.knowledgeDocument.create({
      data: {
        title,
        category,
        source: "Mock 知识库",
        content: `${title}：用于演示智能导诊知识检索与回复生成，不作为真实医疗建议。`,
        tags: json(tags),
      },
    })
    await prisma.knowledgeChunk.createMany({
      data: [
        {
          documentId: document.id,
          chunkIndex: 1,
          content: `${title}核心说明。`,
          keywords: json(tags),
        },
        {
          documentId: document.id,
          chunkIndex: 2,
          content: `${title}适用于高新区健康服务入口原型演示。`,
          keywords: json([...tags, "健康高新"]),
        },
      ],
    })
  }

  await prisma.promptTemplate.createMany({
    data: [
      {
        name: "预问诊结构化追问",
        agentName: "pre_consult_agent",
        version: "v0.1",
        template: "根据居民主诉生成结构化追问。",
        variables: json(["residentProfile", "initialInput", "history"]),
      },
      {
        name: "健康档案摘要",
        agentName: "health_summary_agent",
        version: "v0.1",
        template: "基于历史记录生成健康档案摘要。",
        variables: json(["medicalRecords", "diagnoses", "medications", "allergies"]),
      },
      {
        name: "分诊推荐",
        agentName: "triage_agent",
        version: "v0.1",
        template: "根据结构化报告和规则输出 P0-P4 分诊等级。",
        variables: json(["report", "rules"]),
      },
    ],
  })

  await prisma.modelVersion.create({
    data: {
      provider: "mock",
      modelName: "MockAIProvider",
      version: "v0.1",
      configJson: json({ temperature: 0, mode: "deterministic-demo" }),
      isActive: true,
      description: "第一阶段演示用 Mock AI Provider，占位真实大模型接口。",
    },
  })
}
