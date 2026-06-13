import {
  AgentRunStatus,
  InstitutionType,
  json,
  MessageRole,
  mustGet,
  prisma,
  SessionStatus,
  TriageLevel,
} from "./shared"

export async function seedSessions(
  residents: Map<string, Awaited<ReturnType<typeof prisma.residentProfile.create>>>,
  institutions: Map<string, Awaited<ReturnType<typeof prisma.institution.create>>>,
  departments: Map<string, Awaited<ReturnType<typeof prisma.department.create>>>,
  doctors: Map<string, Awaited<ReturnType<typeof prisma.doctor.create>>>
) {
  const scenarios = [
    {
      key: "chest_pain_high_risk",
      residentKey: "A",
      input: "胸闷胸痛2小时，既往高血压。",
      level: TriageLevel.P1,
      department: "心血管内科",
      careType: "三甲医院急诊/胸痛中心",
      institutionName: "成都市第一人民医院（成都市中西医结合医院）",
      doctorName: "周启明",
      chiefComplaint: "胸闷胸痛2小时",
      presentIllness: "2小时前出现胸闷胸痛，活动后明显，既往高血压。",
      riskFlags: ["胸痛持续", "高龄", "高血压", "需排查急性冠脉综合征"],
    },
    {
      key: "hypertension_followup",
      residentKey: "B",
      input: "高血压复诊，血压最近比较稳定，想续方。",
      level: TriageLevel.P3,
      department: "慢病管理",
      careType: "社区卫生服务中心/家庭医生",
      institutionName: "芳草社区卫生服务中心",
      doctorName: "林青",
      chiefComplaint: "高血压稳定复诊",
      presentIllness: "规律服药，近期家庭血压基本稳定，无胸痛头晕。",
      riskFlags: ["无急性危险信号", "适合社区慢病随访"],
    },
    {
      key: "child_fever",
      residentKey: "C",
      input: "5岁儿童发热1天，最高38.8度。",
      level: TriageLevel.P2,
      department: "儿科",
      careType: "儿科门诊或综合医院",
      institutionName: "成都市第一人民医院（成都市中西医结合医院）",
      doctorName: "赵雨",
      chiefComplaint: "儿童发热1天",
      presentIllness: "发热1天，最高38.8度，伴轻微咳嗽，精神尚可。",
      riskFlags: ["儿童发热", "需观察精神状态和持续高热"],
    },
    {
      key: "high_glucose_exam",
      residentKey: "D",
      input: "体检发现血糖偏高，想知道去哪儿复查。",
      level: TriageLevel.P3,
      department: "慢病管理",
      careType: "社区慢病管理或内分泌门诊",
      institutionName: "锦城社区卫生服务中心",
      doctorName: "郑梅",
      chiefComplaint: "体检血糖偏高",
      presentIllness: "体检空腹血糖6.8mmol/L，暂无明显多饮多尿。",
      riskFlags: ["体检异常", "建议复查空腹血糖和糖化血红蛋白"],
    },
  ]

  for (const scenario of scenarios) {
    const resident = mustGet(residents, scenario.residentKey)
    const institution = mustGet(institutions, scenario.institutionName)
    const department = mustGet(departments, `${scenario.institutionName}:${scenario.department}`)
    const doctor = mustGet(doctors, scenario.doctorName)
    const session = await prisma.preConsultSession.create({
      data: {
        residentId: resident.id,
        status: SessionStatus.GUIDED,
        initialInput: scenario.input,
        scenarioKey: scenario.key,
      },
    })

    await prisma.preConsultMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: MessageRole.USER,
          content: scenario.input,
          structuredJson: json({ source: "resident", scenario: scenario.key }),
        },
        {
          sessionId: session.id,
          role: MessageRole.ASSISTANT,
          content: "已根据症状进行结构化追问并生成预问诊摘要。",
          structuredJson: json({ nextStep: "triage" }),
        },
      ],
    })

    await prisma.preConsultReport.create({
      data: {
        sessionId: session.id,
        chiefComplaint: scenario.chiefComplaint,
        presentIllness: scenario.presentIllness,
        pastHistory: resident.name === "张建国" || resident.name === "李秀兰" ? "高血压病史。" : "详见健康档案。",
        medicationHistory: resident.name === "张建国" ? "长期服用降压药。" : "详见历史用药。",
        allergyHistory: resident.name === "张建国" ? "青霉素过敏。" : "无明确药物过敏史。",
        riskFlags: json(scenario.riskFlags),
        patientExplanation: "以下导诊建议来自 Mock AI 原型，仅用于演示。",
        doctorSummary: `${resident.name}：${scenario.chiefComplaint}，建议${scenario.careType}。`,
        structuredJson: json({
          residentId: resident.id,
          scenarioKey: scenario.key,
          symptoms: scenario.riskFlags,
        }),
      },
    })

    await prisma.triageResult.create({
      data: {
        sessionId: session.id,
        level: scenario.level,
        suggestedDepartment: scenario.department,
        suggestedCareType: scenario.careType,
        reasons: json(scenario.riskFlags),
        confidence: scenario.level === TriageLevel.P1 ? 0.92 : 0.86,
      },
    })

    const recommendation = await prisma.recommendation.create({
      data: {
        sessionId: session.id,
        institutionId: institution.id,
        departmentId: department.id,
        doctorId: doctor.id,
        rank: 1,
        score: scenario.level === TriageLevel.P1 ? 96 : 88,
        reasons: json([
          "症状与科室匹配",
          institution.type === InstitutionType.TERTIARY_HOSPITAL ? "三甲医院资源匹配" : "社区慢病服务匹配",
          doctor.isExpert ? "专家池医生" : "家庭医生/基层服务匹配",
        ]),
      },
    })

    await prisma.guidePlan.create({
      data: {
        sessionId: session.id,
        recommendationId: recommendation.id,
        title: `${scenario.department}导诊指引`,
        steps: json(["查看预问诊报告", "携带既往检查和用药信息", "按推荐机构和科室就诊"]),
        preparationItems: json(["身份证或医保凭证", "既往病历", "当前用药清单"]),
        navigationText: `建议前往${scenario.institutionName}${scenario.department}。`,
      },
    })

    await createAgentRuns(session.id, scenario.key, scenario.input)
  }

  await prisma.agentFeedback.create({
    data: {
      rating: 4,
      comment: "Mock 报告结构清晰，后续需增加医生确认流程。",
      source: "doctor_mock",
    },
  })

  await prisma.qualityIssue.create({
    data: {
      title: "模型配置仍为 Mock",
      description: "第一阶段未接入真实大模型 Provider，需要在后续版本补齐配置和审计。",
      severity: "LOW",
      status: "OPEN",
    },
  })
}

async function createAgentRuns(sessionId: string, scenarioKey: string, initialInput: string) {
  const runs = [
    ["pre_consult_agent", "预问诊", { initialInput }, { questions: ["症状持续时间", "既往病史"] }],
    ["health_summary_agent", "健康档案摘要", { scenarioKey }, { summary: "已生成健康档案摘要" }],
    ["triage_agent", "分诊", { scenarioKey }, { level: "mock-level" }],
    ["recommendation_agent", "推荐", { scenarioKey }, { recommendations: 1 }],
    ["guide_agent", "导诊", { scenarioKey }, { guidePlan: "已生成导诊指引" }],
  ] as const

  for (const [agentName, stepName, input, output] of runs) {
    await prisma.agentRun.create({
      data: {
        sessionId,
        agentName,
        inputJson: json(input),
        outputJson: json(output),
        status: AgentRunStatus.SUCCESS,
        latencyMs: 120,
        steps: {
          create: {
            stepName,
            inputJson: json(input),
            outputJson: json(output),
            status: AgentRunStatus.SUCCESS,
            latencyMs: 120,
          },
        },
      },
    })
  }
}
