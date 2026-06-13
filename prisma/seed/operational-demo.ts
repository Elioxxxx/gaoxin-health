import {
  date,
  IntentType,
  json,
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
  mustGet,
  prisma,
  RiskFocusCategory,
  UserActionEventType,
} from "./shared"

type OperationalCase = {
  residentKey: string
  caseTitle: string
  hospitalName: string
  hospitalDepartment: string
  communityName: string
  communityDepartment: string
  examInstitution: string
  mainDiagnosis: string
  secondaryDiagnosis: string
  medications: Array<[string, string, string, string]>
  labs: Array<[string, string, string, string, string]>
  allergy?: [string, string, string, string]
  intentType: IntentType
  leadType: LeadType
  receiverType: LeadReceiverType
  priority: LeadPriority
  behaviorKeywords: string[]
  focusTitles: string[]
}

export async function seedOperationalDemoData(
  residents: Map<string, Awaited<ReturnType<typeof prisma.residentProfile.create>>>,
  institutions: Map<string, Awaited<ReturnType<typeof prisma.institution.create>>>,
  departments: Map<string, Awaited<ReturnType<typeof prisma.department.create>>>
) {
  const cases = buildOperationalCases()

  for (const item of cases) {
    const resident = mustGet(residents, item.residentKey)
    const hospital = mustGet(institutions, item.hospitalName)
    const community = mustGet(institutions, item.communityName)
    const leadInstitution =
      item.receiverType === LeadReceiverType.HOSPITAL
        ? hospital
        : item.receiverType === LeadReceiverType.COMMUNITY_HEALTH_CENTER
          ? community
          : null
    const leadDepartment =
      item.receiverType === LeadReceiverType.HOSPITAL
        ? mustGet(departments, `${item.hospitalName}:${item.hospitalDepartment}`)
        : item.receiverType === LeadReceiverType.COMMUNITY_HEALTH_CENTER
          ? mustGet(departments, `${item.communityName}:${item.communityDepartment}`)
          : null

    const records = await createOperationalMedicalRecords(resident.id, item)
    await createOperationalDiagnoses(resident.id, records[0].id, item)
    await createOperationalMedications(resident.id, records[0].id, item)
    await createOperationalLabs(resident.id, records[2].id, item)
    await createOperationalAllergy(resident.id, item)
    await createOperationalHealthSummary(resident, item)
    await createDoctorHealthProfile(resident.id, item)
    const eventIds = await createUserActionEvents(resident.id, item)
    const insight = await prisma.intentInsight.create({
      data: {
        residentId: resident.id,
        intentType: item.intentType,
        title: `${resident.name}${item.caseTitle}意图洞察`,
        summary: `${resident.name}近期围绕“${item.behaviorKeywords[0]}”发生多次查询、查看和导诊相关动作，系统判断存在明确服务承接价值。`,
        confidence: item.priority === LeadPriority.URGENT ? 0.93 : 0.82,
        evidenceEventsJson: json(eventIds),
        suggestedReceiverType: item.receiverType,
        suggestedAction: buildSuggestedAction(item),
        priority: item.priority,
        status: LeadStatus.PENDING,
      },
    })

    const lead = await prisma.serviceLead.create({
      data: {
        residentId: resident.id,
        intentInsightId: insight.id,
        receiverType: item.receiverType,
        receiverInstitutionId: leadInstitution?.id,
        receiverDepartmentId: leadDepartment?.id,
        leadType: item.leadType,
        title: `${resident.name}${item.caseTitle}服务线索`,
        summary: `${resident.name}已形成${item.caseTitle}相关服务线索，建议由${receiverName(item.receiverType)}跟进。`,
        suggestedAction: buildSuggestedAction(item),
        priority: item.priority,
        status: LeadStatus.PENDING,
      },
    })

    await prisma.leadFeedback.create({
      data: {
        serviceLeadId: lead.id,
        operatorRole: "Mock运营专员",
        operatorName: "系统演示",
        feedbackType: "AUTO_CREATED",
        comment: "由 Mock 行为意图规则生成，供运营演示使用。",
      },
    })
  }
}

function buildOperationalCases(): OperationalCase[] {
  return [
    {
      residentKey: "A",
      caseTitle: "心血管专科就医",
      hospitalName: "成都市第一人民医院（成都市中西医结合医院）",
      hospitalDepartment: "心血管内科",
      communityName: "肖家河社区卫生服务中心",
      communityDepartment: "慢病管理",
      examInstitution: "成都市第一人民医院（成都市中西医结合医院）",
      mainDiagnosis: "高血压病",
      secondaryDiagnosis: "冠心病风险待排查",
      medications: [
        ["苯磺酸氨氯地平片", "5mg", "每日一次", "社区随访提示近两周漏服2次"],
        ["阿托伐他汀钙片", "20mg", "每晚一次", "血脂偏高后建议继续规范服用"],
      ],
      labs: [
        ["静息心电图", "ST-T改变", "", "异常", "提示需结合症状复核"],
        ["低密度脂蛋白胆固醇", "3.8", "mmol/L", "偏高", "较上次升高"],
        ["血压", "158/92", "mmHg", "偏高", "家庭血压控制不稳"],
        ["肌钙蛋白T", "待复查", "", "待核实", "胸痛场景建议急诊排查"],
      ],
      allergy: ["青霉素", "皮疹", "中", "自述明确过敏史"],
      intentType: IntentType.ACUTE_CARE_INTENT,
      leadType: LeadType.SPECIALTY_VISIT,
      receiverType: LeadReceiverType.HOSPITAL,
      priority: LeadPriority.URGENT,
      behaviorKeywords: ["胸闷是不是心脏病", "心血管专家", "胸痛中心", "高血压胸痛", "导诊未挂号"],
      focusTitles: ["心血管急性事件风险", "心电图ST-T改变待核实", "血压控制不稳", "用药依从性不足", "7日内多次胸痛查询", "已查看专家未挂号"],
    },
    {
      residentKey: "B",
      caseTitle: "高血压慢病复诊",
      hospitalName: "成都市第一人民医院（成都市中西医结合医院）",
      hospitalDepartment: "心血管内科",
      communityName: "芳草社区卫生服务中心",
      communityDepartment: "慢病管理",
      examInstitution: "芳草社区卫生服务中心",
      mainDiagnosis: "高血压病",
      secondaryDiagnosis: "血脂边缘升高",
      medications: [
        ["厄贝沙坦片", "150mg", "每日一次", "续方需求明确"],
        ["氨氯地平片", "5mg", "每日一次", "血压波动时联合使用"],
      ],
      labs: [
        ["血压", "132/80", "mmHg", "正常", "社区随访控制尚可"],
        ["低密度脂蛋白胆固醇", "3.2", "mmol/L", "临界", "建议生活方式管理"],
        ["血肌酐", "72", "umol/L", "正常", "用药安全可继续观察"],
        ["尿常规蛋白", "阴性", "", "正常", "慢病随访记录"],
      ],
      intentType: IntentType.CHRONIC_DISEASE_MANAGEMENT,
      leadType: LeadType.CHRONIC_FOLLOWUP,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["高血压复诊开药", "家庭医生", "芳草社区", "血压记录", "续方"],
      focusTitles: ["长期血压控制", "社区复诊续方", "家庭血压记录", "家庭医生承接"],
    },
    {
      residentKey: "C",
      caseTitle: "儿童发热儿科评估",
      hospitalName: "成都市第一人民医院（成都市中西医结合医院）",
      hospitalDepartment: "儿科",
      communityName: "桂溪社区卫生服务中心",
      communityDepartment: "儿童保健",
      examInstitution: "桂溪社区卫生服务中心",
      mainDiagnosis: "急性上呼吸道感染",
      secondaryDiagnosis: "儿童发热待观察",
      medications: [
        ["对乙酰氨基酚混悬滴剂", "按体重", "发热时使用", "退热对症"],
        ["口服补液盐", "按需", "少量多次", "发热时注意补液"],
      ],
      labs: [
        ["血常规白细胞", "8.2", "10^9/L", "正常", "暂不支持明显细菌感染"],
        ["C反应蛋白", "6", "mg/L", "轻度升高", "结合症状观察"],
        ["体温", "38.8", "℃", "偏高", "家长记录"],
        ["流感抗原", "阴性", "", "正常", "报告查询记录"],
      ],
      intentType: IntentType.CHILD_HEALTH,
      leadType: LeadType.CHILD_CARE,
      receiverType: LeadReceiverType.HOSPITAL,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["儿童发热要不要去医院", "儿科门诊", "退热药", "儿童保健", "发热观察"],
      focusTitles: ["儿童发热持续时间", "精神状态与脱水观察", "退热药剂量", "儿科就诊指征"],
    },
    {
      residentKey: "D",
      caseTitle: "血糖偏高健康管理",
      hospitalName: "成都上锦南府医院",
      hospitalDepartment: "内分泌科",
      communityName: "锦城社区卫生服务中心",
      communityDepartment: "慢病管理",
      examInstitution: "锦城社区卫生服务中心",
      mainDiagnosis: "糖代谢异常",
      secondaryDiagnosis: "超重",
      medications: [
        ["暂未用药", "无", "无", "先进行饮食运动干预"],
        ["维生素D补充剂", "400IU", "每日一次", "体检后健康管理建议"],
      ],
      labs: [
        ["空腹血糖", "6.8", "mmol/L", "偏高", "体检异常"],
        ["糖化血红蛋白", "6.1", "%", "临界", "建议3个月复查"],
        ["甘油三酯", "2.1", "mmol/L", "偏高", "代谢风险"],
        ["BMI", "27.2", "kg/m2", "偏高", "生活方式干预"],
      ],
      intentType: IntentType.CHRONIC_DISEASE_MANAGEMENT,
      leadType: LeadType.CHRONIC_FOLLOWUP,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["血糖偏高怎么办", "内分泌科", "慢病管理", "体检异常", "健康任务"],
      focusTitles: ["糖代谢异常待复查", "体重与生活方式", "社区慢病建档", "内分泌转诊条件"],
    },
    {
      residentKey: "P05",
      caseTitle: "慢阻肺呼吸康复",
      hospitalName: "成都上锦南府医院",
      hospitalDepartment: "呼吸内科",
      communityName: "中和社区卫生服务中心",
      communityDepartment: "康复随访",
      examInstitution: "成都上锦南府医院",
      mainDiagnosis: "慢性阻塞性肺疾病",
      secondaryDiagnosis: "反复咳喘",
      medications: [
        ["布地奈德福莫特罗吸入剂", "1吸", "每日两次", "需确认吸入方法"],
        ["噻托溴铵吸入剂", "1吸", "每日一次", "社区随访提示偶有漏用"],
      ],
      labs: [
        ["肺功能FEV1/FVC", "58", "%", "降低", "慢阻肺气流受限"],
        ["胸部CT", "慢性支气管炎改变", "", "异常", "影像随访"],
        ["血氧饱和度", "94", "%", "临界", "活动后气促"],
        ["C反应蛋白", "12", "mg/L", "偏高", "急性加重需排查"],
      ],
      intentType: IntentType.SPECIALTY_CARE_INTENT,
      leadType: LeadType.CHRONIC_FOLLOWUP,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.HIGH,
      behaviorKeywords: ["咳喘反复", "吸入药怎么用", "呼吸内科", "社区康复", "慢阻肺随访"],
      focusTitles: ["慢阻肺急性加重风险", "吸入药依从性", "肺功能下降", "社区康复训练"],
    },
    {
      residentKey: "P06",
      caseTitle: "糖尿病肾病风险",
      hospitalName: "成都上锦南府医院",
      hospitalDepartment: "内分泌科",
      communityName: "石羊社区卫生服务中心",
      communityDepartment: "慢病管理",
      examInstitution: "成都上锦南府医院",
      mainDiagnosis: "2型糖尿病",
      secondaryDiagnosis: "肾功能轻度异常",
      medications: [
        ["二甲双胍片", "0.5g", "每日两次", "需结合肾功能评估"],
        ["达格列净片", "10mg", "每日一次", "关注泌尿感染和肾功能"],
      ],
      labs: [
        ["糖化血红蛋白", "8.2", "%", "偏高", "控制不佳"],
        ["尿微量白蛋白", "68", "mg/L", "偏高", "提示早期肾损害风险"],
        ["血肌酐", "98", "umol/L", "轻度偏高", "需随访eGFR"],
        ["空腹血糖", "9.1", "mmol/L", "偏高", "社区血糖记录"],
      ],
      allergy: ["碘造影剂", "皮疹瘙痒", "中", "既往增强检查后出现"],
      intentType: IntentType.CHRONIC_DISEASE_MANAGEMENT,
      leadType: LeadType.CHRONIC_FOLLOWUP,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.HIGH,
      behaviorKeywords: ["糖尿病肾病", "尿微量白蛋白", "血糖控制", "社区随访", "内分泌医生"],
      focusTitles: ["糖化血红蛋白偏高", "尿微量白蛋白异常", "肾功能用药安全", "社区糖尿病规范随访", "并发症筛查", "复查依从性"],
    },
    {
      residentKey: "P07",
      caseTitle: "孕期贫血产检",
      hospitalName: "四川省中西医结合医院高新医院（成都高新区中医医院）",
      hospitalDepartment: "中医科",
      communityName: "芳草社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "芳草社区卫生服务中心",
      mainDiagnosis: "孕期贫血",
      secondaryDiagnosis: "孕期营养咨询",
      medications: [
        ["琥珀酸亚铁片", "0.1g", "每日一次", "遵医嘱补铁"],
        ["叶酸片", "0.4mg", "每日一次", "孕期补充"],
      ],
      labs: [
        ["血红蛋白", "103", "g/L", "偏低", "轻度贫血"],
        ["血清铁蛋白", "18", "ug/L", "偏低", "缺铁倾向"],
        ["空腹血糖", "4.8", "mmol/L", "正常", "产检记录"],
        ["尿蛋白", "阴性", "", "正常", "产检记录"],
      ],
      intentType: IntentType.MATERNAL_HEALTH,
      leadType: LeadType.MATERNAL_CARE,
      receiverType: LeadReceiverType.HEALTH_COMMISSION,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["孕期贫血怎么办", "产检记录", "补铁", "孕妇能不能吃药", "妇幼服务"],
      focusTitles: ["孕产妇特殊人群", "贫血趋势", "用药安全", "产检连续性"],
    },
    {
      residentKey: "P08",
      caseTitle: "健康焦虑睡眠咨询",
      hospitalName: "四川省中西医结合医院高新医院（成都高新区中医医院）",
      hospitalDepartment: "中医科",
      communityName: "桂溪社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "桂溪社区卫生服务中心",
      mainDiagnosis: "失眠",
      secondaryDiagnosis: "焦虑状态",
      medications: [
        ["褪黑素", "按需", "睡前", "自行购买，需评估使用"],
        ["中药调理", "待辨证", "遵医嘱", "不可自行叠加镇静药"],
      ],
      labs: [
        ["甲状腺功能TSH", "2.1", "mIU/L", "正常", "排除部分躯体因素"],
        ["心电图", "窦性心律", "", "正常", "反复心悸咨询后检查"],
        ["睡眠时长", "5.1", "小时", "不足", "自填健康数据"],
        ["焦虑筛查量表", "9", "分", "轻度", "仅作健康管理参考"],
      ],
      intentType: IntentType.HEALTH_ANXIETY,
      leadType: LeadType.HEALTH_EDUCATION,
      receiverType: LeadReceiverType.HEALTH_COMMISSION,
      priority: LeadPriority.LOW,
      behaviorKeywords: ["失眠会不会猝死", "反复心慌", "报告正常还不放心", "睡眠健康", "健康焦虑"],
      focusTitles: ["健康焦虑行为", "睡眠不足", "重复咨询频繁", "科普与心理支持"],
    },
    {
      residentKey: "P09",
      caseTitle: "代谢异常生活方式干预",
      hospitalName: "成都高新区人民医院（四川大学华西高新医院）",
      hospitalDepartment: "内分泌科",
      communityName: "合作社区卫生服务中心",
      communityDepartment: "慢病管理",
      examInstitution: "合作社区卫生服务中心",
      mainDiagnosis: "脂肪肝",
      secondaryDiagnosis: "高尿酸血症",
      medications: [
        ["非布司他", "20mg", "每日一次", "是否启用需医生评估"],
        ["暂未用药", "无", "无", "以体重管理为主"],
      ],
      labs: [
        ["尿酸", "486", "umol/L", "偏高", "高尿酸"],
        ["ALT", "72", "U/L", "偏高", "脂肪肝相关"],
        ["甘油三酯", "2.6", "mmol/L", "偏高", "代谢风险"],
        ["BMI", "29.1", "kg/m2", "偏高", "肥胖"],
      ],
      intentType: IntentType.PUBLIC_HEALTH_FOLLOWUP,
      leadType: LeadType.HEALTH_EDUCATION,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["尿酸高怎么办", "脂肪肝", "减重门诊", "体检异常", "健康管理"],
      focusTitles: ["体检异常聚集", "生活方式风险", "痛风风险", "社区健康管理"],
    },
    {
      residentKey: "P10",
      caseTitle: "胃痛与幽门螺杆菌复查",
      hospitalName: "四川现代医院（高新院区）",
      hospitalDepartment: "消化内科",
      communityName: "中和社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "四川现代医院（高新院区）",
      mainDiagnosis: "慢性胃炎",
      secondaryDiagnosis: "幽门螺杆菌感染",
      medications: [
        ["艾司奥美拉唑", "20mg", "每日两次", "根除方案需医生确认"],
        ["阿莫西林克拉维酸钾", "待评估", "遵医嘱", "使用前需核实过敏史"],
      ],
      labs: [
        ["幽门螺杆菌呼气试验", "阳性", "", "异常", "需规范根除和复查"],
        ["胃镜", "慢性非萎缩性胃炎", "", "异常", "消化专科记录"],
        ["血红蛋白", "136", "g/L", "正常", "暂未提示明显失血"],
        ["粪便隐血", "阴性", "", "正常", "复查记录"],
      ],
      intentType: IntentType.REPORT_INTERPRETATION,
      leadType: LeadType.REPORT_REVIEW,
      receiverType: LeadReceiverType.HOSPITAL,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["幽门螺杆菌阳性", "胃痛反复", "胃镜报告", "消化内科", "复查"],
      focusTitles: ["幽门螺杆菌阳性", "胃痛反复", "根除方案依从性", "复查时间点"],
    },
    {
      residentKey: "P11",
      caseTitle: "老年跌倒与骨质疏松",
      hospitalName: "四川省中西医结合医院高新医院（成都高新区中医医院）",
      hospitalDepartment: "康复医学科",
      communityName: "西园社区卫生服务中心",
      communityDepartment: "老年健康",
      examInstitution: "西园社区卫生服务中心",
      mainDiagnosis: "骨质疏松",
      secondaryDiagnosis: "跌倒风险",
      medications: [
        ["碳酸钙D3片", "600mg", "每日一次", "补钙"],
        ["阿仑膦酸钠", "70mg", "每周一次", "需确认服药方法"],
      ],
      labs: [
        ["骨密度T值", "-2.7", "", "异常", "骨质疏松"],
        ["25羟维生素D", "18", "ng/mL", "偏低", "需补充"],
        ["跌倒风险评估", "中高风险", "", "异常", "老年健康评估"],
        ["血钙", "2.28", "mmol/L", "正常", "用药前评估"],
      ],
      allergy: ["阿司匹林", "胃部不适", "轻", "不耐受，需医生评估"],
      intentType: IntentType.ELDERLY_HEALTH,
      leadType: LeadType.ELDERLY_CARE,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["骨质疏松", "跌倒风险", "康复随访", "老年健康", "补钙"],
      focusTitles: ["跌倒风险", "骨密度异常", "服药方法", "社区康复随访"],
    },
    {
      residentKey: "P12",
      caseTitle: "抗生素用药安全",
      hospitalName: "成都上锦南府医院",
      hospitalDepartment: "呼吸内科",
      communityName: "合作社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "合作社区卫生服务中心",
      mainDiagnosis: "急性支气管炎",
      secondaryDiagnosis: "青霉素过敏",
      medications: [
        ["右美沙芬愈创甘油醚糖浆", "10ml", "每日三次", "止咳对症"],
        ["抗生素", "待评估", "遵医嘱", "青霉素过敏，避免自行使用"],
      ],
      labs: [
        ["血常规白细胞", "7.6", "10^9/L", "正常", "暂不支持明显细菌感染"],
        ["C反应蛋白", "9", "mg/L", "轻度升高", "结合症状判断"],
        ["胸片", "未见明显肺炎", "", "正常", "报告查询"],
        ["体温", "37.9", "℃", "偏高", "自填记录"],
      ],
      allergy: ["青霉素", "全身皮疹伴瘙痒", "高", "明确过敏史，需醒目标注"],
      intentType: IntentType.MEDICATION_SAFETY,
      leadType: LeadType.MEDICATION_SAFETY,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.HIGH,
      behaviorKeywords: ["青霉素过敏能吃什么抗生素", "咳嗽发热", "抗生素", "头孢能不能吃", "合理用药"],
      focusTitles: ["青霉素过敏", "反复搜索抗生素", "暂不支持自行抗菌药", "用药安全宣教", "过敏史核实", "呼吸症状观察"],
    },
    {
      residentKey: "P13",
      caseTitle: "甲状腺结节报告解读",
      hospitalName: "成都上锦南府医院",
      hospitalDepartment: "内分泌科",
      communityName: "桂溪社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "成都上锦南府医院",
      mainDiagnosis: "甲状腺结节",
      secondaryDiagnosis: "报告焦虑",
      medications: [
        ["暂未用药", "无", "无", "结节随访为主"],
        ["左甲状腺素", "不适用", "无", "甲功正常暂不启用"],
      ],
      labs: [
        ["甲状腺超声", "TI-RADS 3类结节", "", "随访", "建议定期复查"],
        ["TSH", "1.9", "mIU/L", "正常", "甲功正常"],
        ["FT4", "15.2", "pmol/L", "正常", "甲功正常"],
        ["甲状腺抗体", "阴性", "", "正常", "报告解读"],
      ],
      intentType: IntentType.REPORT_INTERPRETATION,
      leadType: LeadType.REPORT_REVIEW,
      receiverType: LeadReceiverType.HOSPITAL,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["甲状腺结节会不会癌变", "报告怎么看", "反复查看超声", "内分泌科", "复查时间"],
      focusTitles: ["甲状腺结节随访", "报告焦虑", "甲功正常", "复查时间提醒", "过度就医风险", "专科复查建议"],
    },
    {
      residentKey: "P14",
      caseTitle: "卒中二级预防",
      hospitalName: "成都市第一人民医院（成都市中西医结合医院）",
      hospitalDepartment: "心血管内科",
      communityName: "肖家河社区卫生服务中心",
      communityDepartment: "慢病管理",
      examInstitution: "成都市第一人民医院（成都市中西医结合医院）",
      mainDiagnosis: "脑梗死后遗症",
      secondaryDiagnosis: "高血压病",
      medications: [
        ["氯吡格雷片", "75mg", "每日一次", "卒中二级预防"],
        ["瑞舒伐他汀钙片", "10mg", "每晚一次", "调脂稳定斑块"],
      ],
      labs: [
        ["血压", "152/88", "mmHg", "偏高", "波动明显"],
        ["LDL-C", "2.9", "mmol/L", "偏高", "卒中二级预防需更严格控制"],
        ["颈动脉超声", "斑块形成", "", "异常", "既往重大病史相关"],
        ["空腹血糖", "6.2", "mmol/L", "临界", "代谢风险"],
      ],
      allergy: ["阿司匹林", "胃痛明显", "中", "既往不耐受，需替代方案"],
      intentType: IntentType.CHRONIC_DISEASE_MANAGEMENT,
      leadType: LeadType.CHRONIC_FOLLOWUP,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.HIGH,
      behaviorKeywords: ["脑梗后血压波动", "卒中复发", "降压药", "社区随访", "心血管医生"],
      focusTitles: ["卒中二级预防", "血压波动", "抗血小板用药安全", "LDL-C控制", "社区医院协同", "复发风险宣教"],
    },
    {
      residentKey: "P15",
      caseTitle: "乳腺结节复查",
      hospitalName: "成都市第一人民医院（成都市中西医结合医院）",
      hospitalDepartment: "中医科",
      communityName: "芳草社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "芳草社区卫生服务中心",
      mainDiagnosis: "乳腺结节",
      secondaryDiagnosis: "体检异常",
      medications: [
        ["暂未用药", "无", "无", "以复查随访为主"],
        ["逍遥丸", "待评估", "遵医嘱", "不可替代影像复查"],
      ],
      labs: [
        ["乳腺超声", "BI-RADS 3类", "", "随访", "建议定期复查"],
        ["CA153", "16", "U/mL", "正常", "体检项目"],
        ["血常规", "正常", "", "正常", "体检记录"],
        ["肝功能", "正常", "", "正常", "体检记录"],
      ],
      intentType: IntentType.REPORT_INTERPRETATION,
      leadType: LeadType.REPORT_REVIEW,
      receiverType: LeadReceiverType.HEALTH_COMMISSION,
      priority: LeadPriority.MEDIUM,
      behaviorKeywords: ["乳腺结节", "报告解读", "妇女健康", "复查", "体检异常"],
      focusTitles: ["乳腺结节复查", "妇女健康筛查", "报告解读需求", "随访提醒"],
    },
    {
      residentKey: "P16",
      caseTitle: "呼吸道症状合理用药",
      hospitalName: "成都上锦南府医院",
      hospitalDepartment: "呼吸内科",
      communityName: "锦城社区卫生服务中心",
      communityDepartment: "全科",
      examInstitution: "锦城社区卫生服务中心",
      mainDiagnosis: "急性上呼吸道感染",
      secondaryDiagnosis: "合理用药咨询",
      medications: [
        ["复方氨酚烷胺胶囊", "1粒", "每日两次", "对症用药"],
        ["抗生素", "不建议自行使用", "遵医嘱", "需医生评估细菌感染证据"],
      ],
      labs: [
        ["血常规白细胞", "6.9", "10^9/L", "正常", "支持病毒感染可能"],
        ["C反应蛋白", "5", "mg/L", "正常", "抗生素证据不足"],
        ["体温", "38.1", "℃", "偏高", "自填记录"],
        ["胸片", "未见明显异常", "", "正常", "报告记录"],
      ],
      intentType: IntentType.MEDICATION_SAFETY,
      leadType: LeadType.HEALTH_EDUCATION,
      receiverType: LeadReceiverType.COMMUNITY_HEALTH_CENTER,
      priority: LeadPriority.LOW,
      behaviorKeywords: ["发热咳嗽吃什么抗生素", "头孢", "呼吸内科", "全科", "健康教育"],
      focusTitles: ["抗生素搜索频繁", "呼吸道症状观察", "合理用药宣教", "全科承接"],
    },
  ]
}

async function createOperationalMedicalRecords(residentId: string, item: OperationalCase) {
  const records = [
    {
      institutionName: item.hospitalName,
      departmentName: item.hospitalDepartment,
      visitDate: date("2025-09-12"),
      chiefComplaint: `${item.caseTitle}相关专科就诊`,
      diagnosisText: `${item.mainDiagnosis}；${item.secondaryDiagnosis}`,
      treatmentText: `建议结合${item.hospitalDepartment}意见完善评估，并保留检查资料。`,
      sourceType: "hospital",
    },
    {
      institutionName: item.communityName,
      departmentName: item.communityDepartment,
      visitDate: date("2025-11-18"),
      chiefComplaint: `${item.caseTitle}社区随访`,
      diagnosisText: `${item.mainDiagnosis}随访`,
      treatmentText: "家庭医生团队记录随访情况，提示连续健康管理。",
      sourceType: "community",
    },
    {
      institutionName: item.examInstitution,
      departmentName: "体检/报告查询",
      visitDate: date("2026-01-08"),
      chiefComplaint: `${item.caseTitle}相关检查报告`,
      diagnosisText: item.secondaryDiagnosis,
      treatmentText: "报告已归集至健康档案，供医生端摘要使用。",
      sourceType: "exam",
    },
    {
      institutionName: item.communityName,
      departmentName: item.communityDepartment,
      visitDate: date("2026-03-22"),
      chiefComplaint: `${item.caseTitle}近期线上咨询后随访`,
      diagnosisText: item.mainDiagnosis,
      treatmentText: "根据居民近期查询和导诊记录，建议主动随访。",
      sourceType: "public_health",
    },
  ]

  const created = []

  for (const record of records) {
    created.push(
      await prisma.medicalRecord.create({
        data: {
          residentId,
          ...record,
        },
      })
    )
  }

  return created
}

async function createOperationalDiagnoses(residentId: string, recordId: string, item: OperationalCase) {
  await prisma.diagnosis.createMany({
    data: [
      {
        residentId,
        recordId,
        name: item.mainDiagnosis,
        diagnosedAt: date("2025-09-12"),
        status: "长期关注",
        notes: `${item.caseTitle}主要问题。`,
      },
      {
        residentId,
        recordId,
        name: item.secondaryDiagnosis,
        diagnosedAt: date("2026-01-08"),
        status: "随访关注",
        notes: "由零散报告和社区记录归集形成。",
      },
    ],
  })
}

async function createOperationalMedications(residentId: string, recordId: string, item: OperationalCase) {
  await prisma.medication.createMany({
    data: item.medications.map(([name, dosage, frequency, notes], index) => ({
      residentId,
      recordId,
      name,
      dosage,
      frequency,
      startDate: date(index === 0 ? "2025-09-12" : "2026-01-08"),
      notes,
    })),
  })
}

async function createOperationalLabs(residentId: string, recordId: string, item: OperationalCase) {
  await prisma.labResult.createMany({
    data: item.labs.map(([itemName, value, unit, abnormalFlag, note], index) => ({
      residentId,
      recordId,
      itemName,
      value,
      unit: unit || null,
      referenceRange: note,
      abnormalFlag,
      resultDate: date(["2025-09-12", "2025-11-18", "2026-01-08", "2026-03-22"][index] ?? "2026-03-22"),
    })),
  })
}

async function createOperationalAllergy(residentId: string, item: OperationalCase) {
  if (!item.allergy) {
    return
  }

  const [allergen, reaction, severity, notes] = item.allergy
  await prisma.allergy.create({
    data: {
      residentId,
      allergen,
      reaction,
      severity,
      notes,
    },
  })
}

async function createOperationalHealthSummary(
  resident: Awaited<ReturnType<typeof prisma.residentProfile.create>>,
  item: OperationalCase
) {
  await prisma.healthSummary.create({
    data: {
      residentId: resident.id,
      title: `${resident.name}运营演示健康档案摘要`,
      summaryText: `${resident.name}存在${item.mainDiagnosis}、${item.secondaryDiagnosis}等健康关注点。系统已从医院、社区、体检和线上行为记录中整理出连续健康档案。`,
      summaryJson: json({
        caseKey: resident.caseKey,
        primaryScenario: resident.primaryScenario,
        majorProblems: [item.mainDiagnosis, item.secondaryDiagnosis],
        serviceLead: item.caseTitle,
      }),
      source: "Operational Demo Mock",
      version: "v0.2",
    },
  })
}

async function createDoctorHealthProfile(residentId: string, item: OperationalCase) {
  const isPriorityCase = ["A", "P06", "P12", "P14"].includes(item.residentKey)
  const focusItems = buildRiskFocusItems(item, isPriorityCase ? 6 : 4)

  await prisma.doctorHealthProfile.create({
    data: {
      residentId,
      summaryTitle: `${item.caseTitle}医生版健康档案`,
      onePageSummary: `该居民围绕${item.caseTitle}形成多源健康信息：医院专科记录、社区随访、检查检验、用药与行为事件均已归集。医生端重点关注${focusItems.map((focus) => focus.title).join("、")}。`,
      majorProblemsJson: json([item.mainDiagnosis, item.secondaryDiagnosis]),
      currentVisitRelevanceJson: json({
        scenario: item.caseTitle,
        relevantRecords: [item.hospitalName, item.communityName, item.examInstitution],
      }),
      riskFocusItemsJson: json(focusItems),
      medicationSafetyJson: json(item.medications.map(([name, dosage, frequency, notes]) => ({ name, dosage, frequency, notes }))),
      allergyAndContraindicationsJson: json(item.allergy ? [{ allergen: item.allergy[0], reaction: item.allergy[1], severity: item.allergy[2], notes: item.allergy[3] }] : []),
      labTrendHighlightsJson: json(item.labs.map(([name, value, unit, flag, note]) => ({ name, value, unit, flag, note }))),
      imagingHighlightsJson: json(item.labs.filter(([name]) => name.includes("CT") || name.includes("超声") || name.includes("胸片") || name.includes("心电图") || name.includes("胃镜"))),
      chronicDiseaseStatusJson: json({
        status: item.priority === LeadPriority.HIGH || item.priority === LeadPriority.URGENT ? "需重点随访" : "常规连续管理",
        diseases: [item.mainDiagnosis, item.secondaryDiagnosis],
      }),
      lifestyleFactorsJson: json({
        behaviorRisk: item.behaviorKeywords,
        advice: "结合居民端行为线索进行健康教育和随访提醒。",
      }),
      publicHealthFollowUpJson: json({
        community: item.communityName,
        department: item.communityDepartment,
        action: buildSuggestedAction(item),
      }),
      dataQualityNotesJson: json(["部分检查来自 Mock 报告查询", "用药依从性需医生面诊核实", "行为事件用于运营演示"]),
      sourceRecordsJson: json([item.hospitalName, item.communityName, item.examInstitution, "健康高新用户行为事件"]),
      doctorChecklistJson: json(focusItems.map((focus) => focus.suggestedDoctorAction)),
      riskFocusItems: {
        create: focusItems.map((focus) => ({
          category: focus.category,
          title: focus.title,
          summary: focus.summary,
          evidenceJson: json(focus.evidence),
          suggestedDoctorAction: focus.suggestedDoctorAction,
          priority: focus.priority,
        })),
      },
    },
  })
}

function buildRiskFocusItems(item: OperationalCase, count: number) {
  const categories = [
    RiskFocusCategory.ACUTE_RISK,
    RiskFocusCategory.CHRONIC_CONTROL,
    RiskFocusCategory.MEDICATION_SAFETY,
    RiskFocusCategory.LAB_TREND,
    RiskFocusCategory.CARE_BEHAVIOR,
    RiskFocusCategory.PUBLIC_HEALTH_FOLLOWUP,
  ]

  return item.focusTitles.slice(0, count).map((title, index) => ({
    category: categories[index] ?? RiskFocusCategory.DATA_QUALITY,
    title,
    summary: `${title}：与${item.caseTitle}密切相关，证据来自就诊记录、检查检验、用药或用户行为。`,
    evidence: {
      labs: item.labs.slice(0, 2).map(([name, value, unit, flag]) => `${name} ${value}${unit} ${flag}`),
      behavior: item.behaviorKeywords.slice(0, 3),
      records: [item.hospitalName, item.communityName],
    },
    suggestedDoctorAction: `面诊时核实${title}，并结合${item.caseTitle}制定随访或转诊建议。`,
    priority: index === 0 ? item.priority : index < 3 ? LeadPriority.MEDIUM : LeadPriority.LOW,
  }))
}

async function createUserActionEvents(residentId: string, item: OperationalCase) {
  const events = [
    [UserActionEventType.SEARCH, "搜索健康问题", "/gaoxin/ai", item.behaviorKeywords[0]],
    [UserActionEventType.AI_CHAT, "咨询小高健康助手", "/gaoxin/pre-consult", item.behaviorKeywords[1]],
    [UserActionEventType.REPORT_VIEW, "查看检查报告", "/gaoxin/report-ai", item.behaviorKeywords[2]],
    [UserActionEventType.RESOURCE_VIEW, "查看医疗资源", "/gaoxin/resources", item.behaviorKeywords[3]],
    [UserActionEventType.GUIDE_ABANDONED, "生成导诊后未挂号", "/gaoxin/records?type=guide", item.behaviorKeywords[4]],
  ] as const
  const ids: string[] = []

  for (const [eventType, eventName, pagePath, content] of events) {
    const event = await prisma.userActionEvent.create({
      data: {
        residentId,
        eventType,
        eventName,
        pagePath,
        content,
        targetType: item.receiverType,
        metadataJson: json({
          caseTitle: item.caseTitle,
          primaryKeyword: item.behaviorKeywords[0],
          mockSource: "运营演示埋点",
        }),
        occurredAt: date("2026-04-20"),
      },
    })
    ids.push(event.id)
  }

  return ids
}

function buildSuggestedAction(item: OperationalCase) {
  if (item.receiverType === LeadReceiverType.HOSPITAL) {
    return `建议${item.hospitalDepartment}导诊人员关注该居民近期行为和检查资料，必要时协助完成专科预约。`
  }

  if (item.receiverType === LeadReceiverType.COMMUNITY_HEALTH_CENTER) {
    return `建议${item.communityName}${item.communityDepartment}团队纳入随访，完成健康教育、复诊提醒或家庭医生承接。`
  }

  return "建议卫健端纳入运营趋势观察，补充科普内容或公卫随访策略。"
}

function receiverName(receiverType: LeadReceiverType) {
  if (receiverType === LeadReceiverType.HOSPITAL) {
    return "医院专科"
  }

  if (receiverType === LeadReceiverType.COMMUNITY_HEALTH_CENTER) {
    return "社区卫生服务中心"
  }

  return "卫健管理端"
}
