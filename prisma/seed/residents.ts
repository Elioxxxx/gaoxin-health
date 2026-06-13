import { date, json, mustGet, prisma, Role } from "./shared"

export async function seedResidents() {
  const residentConfigs = [
    {
      key: "A",
      name: "张建国",
      gender: "男",
      age: 66,
      phone: "13800000001",
      address: "高新区肖家河街道兴蓉社区",
      community: "肖家河社区",
      familyDoctorName: "陈晓",
      tags: ["高血压", "胸痛高风险", "老年人"],
      caseSummary: "66岁男性，高血压多年，近期胸闷胸痛并反复查看心血管医生，适合展示急性心血管风险识别。",
      primaryScenario: "胸闷胸痛与心血管急性事件排查",
    },
    {
      key: "B",
      name: "李秀兰",
      gender: "女",
      age: 58,
      phone: "13800000002",
      address: "高新区芳草街道蓓蕾社区",
      community: "芳草社区",
      familyDoctorName: "林青",
      tags: ["高血压", "稳定复诊", "家庭医生签约"],
      caseSummary: "58岁女性，高血压长期管理对象，复诊开药诉求明确，适合展示社区与家庭医生承接。",
      primaryScenario: "高血压稳定复诊与社区慢病管理",
    },
    {
      key: "C",
      name: "王小宝",
      gender: "男",
      age: 5,
      phone: "13800000003",
      address: "高新区桂溪街道天府三街",
      community: "桂溪社区",
      familyDoctorName: "罗萍",
      tags: ["儿童", "发热", "儿保随访"],
      caseSummary: "5岁儿童，发热咳嗽相关咨询，适合展示儿科导诊和儿童保健协同。",
      primaryScenario: "儿童发热与儿科评估",
    },
    {
      key: "D",
      name: "陈明",
      gender: "男",
      age: 42,
      phone: "13800000004",
      address: "高新区锦城街道锦尚西二路",
      community: "锦城社区",
      familyDoctorName: "谢涛",
      tags: ["血糖偏高", "体检异常", "慢病风险"],
      caseSummary: "42岁男性，体检发现血糖偏高，适合展示体检异常到健康管理任务的闭环。",
      primaryScenario: "体检血糖偏高与慢病风险管理",
    },
    {
      key: "P05",
      name: "赵德全",
      gender: "男",
      age: 72,
      phone: "13800000005",
      address: "高新区中和街道应龙社区",
      community: "中和社区",
      familyDoctorName: "黄丽",
      tags: ["慢阻肺", "反复咳喘", "老年健康", "社区康复"],
      caseSummary: "72岁男性，慢阻肺病史，反复咳喘并存在吸入药使用不规范，适合展示呼吸专科与社区康复。",
      primaryScenario: "慢阻肺反复咳喘与吸入药依从性",
    },
    {
      key: "P06",
      name: "刘桂芳",
      gender: "女",
      age: 69,
      phone: "13800000006",
      address: "高新区石羊街道锦城大道社区",
      community: "石羊社区",
      familyDoctorName: "吴军",
      tags: ["糖尿病", "肾功能关注", "慢病管理", "社区随访"],
      caseSummary: "69岁女性，糖尿病合并肾功能轻度异常和尿微量白蛋白异常，适合展示并发症风险与规范随访。",
      primaryScenario: "糖尿病并发症风险与社区规范随访",
    },
    {
      key: "P07",
      name: "周敏",
      gender: "女",
      age: 34,
      phone: "13800000007",
      address: "高新区芳草街道紫荆社区",
      community: "芳草社区",
      familyDoctorName: "林青",
      tags: ["孕产妇", "贫血", "产检记录", "用药注意"],
      caseSummary: "34岁孕期女性，产检记录分散且存在轻度贫血，适合展示孕产妇特殊人群和妇幼服务线索。",
      primaryScenario: "孕期咨询与贫血产检随访",
    },
    {
      key: "P08",
      name: "黄俊",
      gender: "男",
      age: 29,
      phone: "13800000008",
      address: "高新区桂溪街道金融城社区",
      community: "桂溪社区",
      familyDoctorName: "罗萍",
      tags: ["失眠", "健康焦虑", "反复咨询", "睡眠健康"],
      caseSummary: "29岁男性，失眠焦虑并反复健康咨询，适合展示健康焦虑识别和睡眠健康教育。",
      primaryScenario: "失眠焦虑与健康咨询行为识别",
    },
    {
      key: "P09",
      name: "杨帆",
      gender: "男",
      age: 45,
      phone: "13800000009",
      address: "高新区合作街道清源社区",
      community: "合作社区",
      familyDoctorName: "周琴",
      tags: ["脂肪肝", "高尿酸", "肥胖", "体检异常"],
      caseSummary: "45岁男性，脂肪肝、高尿酸和肥胖，适合展示体检异常到生活方式干预。",
      primaryScenario: "代谢异常与生活方式健康管理",
    },
    {
      key: "P10",
      name: "吴强",
      gender: "男",
      age: 52,
      phone: "13800000010",
      address: "高新区中和街道仁和社区",
      community: "中和社区",
      familyDoctorName: "黄丽",
      tags: ["胃痛反复", "幽门螺杆菌阳性", "报告解读", "消化专科"],
      caseSummary: "52岁男性，胃痛反复且幽门螺杆菌阳性，适合展示消化专科导诊和复查提醒。",
      primaryScenario: "胃痛反复与幽门螺杆菌复查",
    },
    {
      key: "P11",
      name: "郑梅",
      gender: "女",
      age: 63,
      phone: "13800000011",
      address: "高新区西园街道尚雅社区",
      community: "西园社区",
      familyDoctorName: "谢涛",
      tags: ["骨质疏松", "跌倒风险", "老年健康", "康复随访"],
      caseSummary: "63岁女性，骨质疏松并有跌倒风险，适合展示老年健康、康复随访和社区管理。",
      primaryScenario: "骨质疏松与跌倒风险管理",
    },
    {
      key: "P12",
      name: "孙磊",
      gender: "男",
      age: 38,
      phone: "13800000012",
      address: "高新区合作街道清水河社区",
      community: "合作社区",
      familyDoctorName: "周琴",
      tags: ["青霉素过敏", "咳嗽发热", "合理用药", "药物安全"],
      caseSummary: "38岁男性，青霉素过敏且咳嗽发热期间反复搜索抗生素，适合展示用药安全和合理用药提醒。",
      primaryScenario: "咳嗽发热与抗生素用药安全",
    },
    {
      key: "P13",
      name: "唐蓉",
      gender: "女",
      age: 50,
      phone: "13800000013",
      address: "高新区桂溪街道天府三街社区",
      community: "桂溪社区",
      familyDoctorName: "罗萍",
      tags: ["甲状腺结节", "报告解读", "复查提醒", "健康焦虑"],
      caseSummary: "50岁女性，甲状腺结节后反复查看报告，适合展示报告解读、专科复查和焦虑识别。",
      primaryScenario: "甲状腺结节报告解读与复查",
    },
    {
      key: "P14",
      name: "罗成",
      gender: "男",
      age: 60,
      phone: "13800000014",
      address: "高新区肖家河街道新北社区",
      community: "新北社区",
      familyDoctorName: "陈晓",
      tags: ["脑梗既往史", "血压波动", "卒中二级预防", "慢病管理"],
      caseSummary: "60岁男性，既往脑梗并血压波动，适合展示卒中二级预防和医院社区协同。",
      primaryScenario: "脑梗既往史与血压波动管理",
    },
    {
      key: "P15",
      name: "蒋丽",
      gender: "女",
      age: 47,
      phone: "13800000015",
      address: "高新区芳草街道桐梓林社区",
      community: "芳草社区",
      familyDoctorName: "林青",
      tags: ["乳腺结节", "妇女健康", "体检异常", "复查提醒"],
      caseSummary: "47岁女性，乳腺结节体检异常，适合展示妇女健康、报告解读和复查提醒。",
      primaryScenario: "乳腺结节体检异常与妇女健康复查",
    },
    {
      key: "P16",
      name: "何伟",
      gender: "男",
      age: 31,
      phone: "13800000016",
      address: "高新区锦城街道锦尚社区",
      community: "锦城社区",
      familyDoctorName: "郑梅",
      tags: ["发热咳嗽", "抗生素咨询", "呼吸全科", "健康教育"],
      caseSummary: "31岁男性，发热咳嗽且反复搜索抗生素，适合展示呼吸/全科分诊和健康教育。",
      primaryScenario: "发热咳嗽与合理用药健康教育",
    },
  ]

  const residents = new Map<string, Awaited<ReturnType<typeof prisma.residentProfile.create>>>()

  for (const item of residentConfigs) {
    const user = await prisma.user.create({
      data: {
        role: Role.RESIDENT,
        displayName: item.name,
        phone: item.phone,
      },
    })
    const resident = await prisma.residentProfile.create({
      data: {
        userId: user.id,
        name: item.name,
        gender: item.gender,
        age: item.age,
        phone: item.phone,
        address: item.address,
        community: item.community,
        familyDoctorName: item.familyDoctorName,
        caseKey: item.key,
        caseSummary: item.caseSummary,
        primaryScenario: item.primaryScenario,
      },
    })
    residents.set(item.key, resident)

    for (const tag of item.tags) {
      await prisma.healthTag.create({
        data: {
          residentId: resident.id,
          name: tag,
          category: tag.includes("高血压") || tag.includes("血糖") ? "慢病风险" : "人群标签",
          color: tag.includes("高风险") ? "red" : "emerald",
        },
      })
    }
  }

  await prisma.user.create({
    data: {
      role: Role.ADMIN,
      displayName: "高新区卫健委管理员",
      phone: "13900009999",
      adminProfile: {
        create: {
          name: "高新区卫健委管理员",
          title: "平台管理员",
          bureau: "成都市高新区卫生健康局",
        },
      },
    },
  })

  return residents
}

export async function seedResidentHealthData(
  residents: Map<string, Awaited<ReturnType<typeof prisma.residentProfile.create>>>
) {
  const residentA = mustGet(residents, "A")
  const residentB = mustGet(residents, "B")
  const residentC = mustGet(residents, "C")
  const residentD = mustGet(residents, "D")

  const recordA = await prisma.medicalRecord.create({
    data: {
      residentId: residentA.id,
      institutionName: "成都市第一人民医院（成都市中西医结合医院）",
      departmentName: "心血管内科",
      visitDate: date("2025-11-16"),
      chiefComplaint: "血压控制不稳，偶有胸闷",
      diagnosisText: "高血压病2级，高危",
      treatmentText: "调整降压药，建议规律监测血压。",
      sourceType: "Mock HIS",
    },
  })
  await prisma.diagnosis.createMany({
    data: [
      {
        residentId: residentA.id,
        recordId: recordA.id,
        name: "高血压病",
        code: "I10",
        diagnosedAt: date("2018-06-01"),
        status: "长期管理",
        notes: "既往高血压，需规律服药。",
      },
      {
        residentId: residentA.id,
        recordId: recordA.id,
        name: "冠心病风险",
        code: "Z91.8",
        diagnosedAt: date("2025-11-16"),
        status: "风险提示",
        notes: "胸闷胸痛需急诊排查。",
      },
    ],
  })
  await prisma.medication.createMany({
    data: [
      {
        residentId: residentA.id,
        recordId: recordA.id,
        name: "苯磺酸氨氯地平片",
        dosage: "5mg",
        frequency: "每日一次",
        startDate: date("2024-01-01"),
        notes: "降压治疗。",
      },
      {
        residentId: residentA.id,
        recordId: recordA.id,
        name: "阿托伐他汀钙片",
        dosage: "20mg",
        frequency: "每晚一次",
        startDate: date("2025-11-16"),
        notes: "调脂治疗。",
      },
    ],
  })
  await prisma.labResult.createMany({
    data: [
      {
        residentId: residentA.id,
        recordId: recordA.id,
        itemName: "低密度脂蛋白胆固醇",
        value: "3.6",
        unit: "mmol/L",
        referenceRange: "<3.4",
        abnormalFlag: "偏高",
        resultDate: date("2025-11-16"),
      },
      {
        residentId: residentA.id,
        recordId: recordA.id,
        itemName: "静息心电图",
        value: "ST-T改变",
        abnormalFlag: "异常",
        resultDate: date("2025-11-16"),
      },
    ],
  })
  await prisma.allergy.create({
    data: {
      residentId: residentA.id,
      allergen: "青霉素",
      reaction: "皮疹",
      severity: "中",
      notes: "自述青霉素过敏。",
    },
  })

  const recordB = await prisma.medicalRecord.create({
    data: {
      residentId: residentB.id,
      institutionName: "芳草社区卫生服务中心",
      departmentName: "慢病管理",
      visitDate: date("2026-01-12"),
      chiefComplaint: "高血压复诊，近期血压较稳定",
      diagnosisText: "高血压病，控制尚可",
      treatmentText: "续方，建议家庭血压监测。",
      sourceType: "Mock 社区随访",
    },
  })
  await prisma.diagnosis.create({
    data: {
      residentId: residentB.id,
      recordId: recordB.id,
      name: "高血压病",
      code: "I10",
      diagnosedAt: date("2020-04-10"),
      status: "稳定随访",
      notes: "社区慢病管理对象。",
    },
  })
  await prisma.medication.create({
    data: {
      residentId: residentB.id,
      recordId: recordB.id,
      name: "厄贝沙坦片",
      dosage: "150mg",
      frequency: "每日一次",
      startDate: date("2025-01-01"),
      notes: "血压稳定时继续服用。",
    },
  })
  await prisma.labResult.create({
    data: {
      residentId: residentB.id,
      recordId: recordB.id,
      itemName: "血压",
      value: "128/78",
      unit: "mmHg",
      referenceRange: "<140/90",
      abnormalFlag: "正常",
      resultDate: date("2026-01-12"),
    },
  })
  await prisma.allergy.create({
    data: {
      residentId: residentB.id,
      allergen: "无明确药物过敏史",
      reaction: "无",
      severity: "无",
    },
  })

  const recordC = await prisma.medicalRecord.create({
    data: {
      residentId: residentC.id,
      institutionName: "桂溪社区卫生服务中心",
      departmentName: "儿童保健",
      visitDate: date("2025-12-20"),
      chiefComplaint: "儿童咳嗽流涕2天",
      diagnosisText: "急性上呼吸道感染",
      treatmentText: "对症处理，观察体温变化。",
      sourceType: "Mock 社区门诊",
    },
  })
  await prisma.diagnosis.create({
    data: {
      residentId: residentC.id,
      recordId: recordC.id,
      name: "急性上呼吸道感染",
      code: "J06.9",
      diagnosedAt: date("2025-12-20"),
      status: "已好转",
      notes: "无惊厥史。",
    },
  })
  await prisma.medication.create({
    data: {
      residentId: residentC.id,
      recordId: recordC.id,
      name: "对乙酰氨基酚混悬滴剂",
      dosage: "按体重",
      frequency: "发热时使用",
      startDate: date("2025-12-20"),
      endDate: date("2025-12-23"),
      notes: "遵医嘱退热。",
    },
  })
  await prisma.labResult.create({
    data: {
      residentId: residentC.id,
      recordId: recordC.id,
      itemName: "血常规白细胞",
      value: "8.2",
      unit: "10^9/L",
      referenceRange: "4.0-10.0",
      abnormalFlag: "正常",
      resultDate: date("2025-12-20"),
    },
  })
  await prisma.allergy.create({
    data: {
      residentId: residentC.id,
      allergen: "无明确药物过敏史",
      reaction: "无",
      severity: "无",
    },
  })

  const recordD = await prisma.medicalRecord.create({
    data: {
      residentId: residentD.id,
      institutionName: "锦城社区卫生服务中心",
      departmentName: "慢病管理",
      visitDate: date("2026-02-18"),
      chiefComplaint: "体检发现空腹血糖偏高",
      diagnosisText: "糖代谢异常待复查",
      treatmentText: "建议饮食运动干预，复查空腹血糖和糖化血红蛋白。",
      sourceType: "Mock 体检",
    },
  })
  await prisma.diagnosis.create({
    data: {
      residentId: residentD.id,
      recordId: recordD.id,
      name: "糖代谢异常",
      code: "R73.0",
      diagnosedAt: date("2026-02-18"),
      status: "待复查",
      notes: "体检异常，暂未诊断糖尿病。",
    },
  })
  await prisma.labResult.createMany({
    data: [
      {
        residentId: residentD.id,
        recordId: recordD.id,
        itemName: "空腹血糖",
        value: "6.8",
        unit: "mmol/L",
        referenceRange: "3.9-6.1",
        abnormalFlag: "偏高",
        resultDate: date("2026-02-18"),
      },
      {
        residentId: residentD.id,
        recordId: recordD.id,
        itemName: "糖化血红蛋白",
        value: "6.1",
        unit: "%",
        referenceRange: "4.0-6.0",
        abnormalFlag: "临界",
        resultDate: date("2026-02-18"),
      },
    ],
  })
  await prisma.medication.create({
    data: {
      residentId: residentD.id,
      recordId: recordD.id,
      name: "暂未用药",
      dosage: "无",
      frequency: "无",
      notes: "先进行生活方式干预。",
    },
  })
  await prisma.allergy.create({
    data: {
      residentId: residentD.id,
      allergen: "无明确药物过敏史",
      reaction: "无",
      severity: "无",
    },
  })

  for (const resident of residents.values()) {
    await prisma.healthSummary.create({
      data: {
        residentId: resident.id,
        title: `${resident.name}健康档案摘要`,
        summaryText: `${resident.name}的 Mock 健康档案摘要，包含慢病、用药、过敏和近期就诊信息。`,
        summaryJson: json({
          age: resident.age,
          community: resident.community,
          riskTags: resident.name === "张建国" ? ["胸痛高风险", "高血压"] : ["常规随访"],
        }),
        source: "Mock AI Summary",
        version: "v0.1",
      },
    })
    await prisma.healthTask.create({
      data: {
        residentId: resident.id,
        title: resident.name === "王小宝" ? "儿童发热观察" : "健康随访提醒",
        type: "随访",
        status: "待处理",
        dueDate: date("2026-05-10"),
        description: "用于演示健康管理任务。",
      },
    })
  }
}
