import "dotenv/config"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

import {
  AgentRunStatus,
  IntentType,
  InstitutionType,
  LeadPriority,
  LeadReceiverType,
  LeadStatus,
  LeadType,
  MessageRole,
  PrismaClient,
  Role,
  RiskFocusCategory,
  SessionStatus,
  TriageLevel,
  UserActionEventType,
} from "../src/generated/prisma/client"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})
const prisma = new PrismaClient({ adapter })

const json = (value: unknown) => JSON.stringify(value, null, 2)
const date = (value: string) => new Date(`${value}T00:00:00.000Z`)

function mustGet<T>(map: Map<string, T>, key: string): T {
  const value = map.get(key)

  if (!value) {
    throw new Error(`Seed 数据缺失：${key}`)
  }

  return value
}

async function resetDatabase() {
  await prisma.leadFeedback.deleteMany()
  await prisma.serviceLead.deleteMany()
  await prisma.intentInsight.deleteMany()
  await prisma.userActionEvent.deleteMany()
  await prisma.riskFocusItem.deleteMany()
  await prisma.doctorHealthProfile.deleteMany()
  await prisma.qualityIssue.deleteMany()
  await prisma.agentFeedback.deleteMany()
  await prisma.agentStep.deleteMany()
  await prisma.agentRun.deleteMany()
  await prisma.guidePlan.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.triageResult.deleteMany()
  await prisma.preConsultReport.deleteMany()
  await prisma.preConsultMessage.deleteMany()
  await prisma.preConsultSession.deleteMany()
  await prisma.promptTemplate.deleteMany()
  await prisma.modelVersion.deleteMany()
  await prisma.knowledgeChunk.deleteMany()
  await prisma.knowledgeDocument.deleteMany()
  await prisma.matchingRule.deleteMany()
  await prisma.departmentMappingRule.deleteMany()
  await prisma.triageRule.deleteMany()
  await prisma.healthTask.deleteMany()
  await prisma.healthSummary.deleteMany()
  await prisma.allergy.deleteMany()
  await prisma.labResult.deleteMany()
  await prisma.medication.deleteMany()
  await prisma.diagnosis.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.healthTag.deleteMany()
  await prisma.adminProfile.deleteMany()
  await prisma.doctorProfile.deleteMany()
  await prisma.residentProfile.deleteMany()
  await prisma.expertPool.deleteMany()
  await prisma.serviceCapability.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.department.deleteMany()
  await prisma.institution.deleteMany()
  await prisma.user.deleteMany()
}

async function seedInstitutions() {
  const institutionConfigs = [
    {
      name: "成都市第一人民医院（成都市中西医结合医院）",
      type: InstitutionType.TERTIARY_HOSPITAL,
      level: "三甲",
      address: "高新区万象北路18号",
      description: "综合性三甲医院，覆盖急危重症、心脑血管、儿科及中西医结合服务。",
      capabilities: ["急诊急救", "胸痛中心", "心血管专科", "儿科", "中西医结合"],
    },
    {
      name: "成都上锦南府医院",
      type: InstitutionType.TERTIARY_HOSPITAL,
      level: "三甲",
      address: "高新西区尚锦路253号",
      description: "高新西区综合性三甲医院，承担区域综合诊疗与急诊服务。",
      capabilities: ["综合门诊", "呼吸内科", "内分泌科", "儿科", "急诊"],
    },
    {
      name: "四川现代医院（高新院区）",
      type: InstitutionType.TERTIARY_HOSPITAL,
      level: "三甲",
      address: "高新区中和仁和路713号",
      description: "综合性三甲医院，提供心血管、消化、呼吸和儿科等专科服务。",
      capabilities: ["综合诊疗", "心血管内科", "消化内科", "呼吸内科", "儿科"],
    },
    {
      name: "四川省中西医结合医院高新医院（成都高新区中医医院）",
      type: InstitutionType.TERTIARY_HOSPITAL,
      level: "三甲",
      address: "新川新程大道南侧",
      description: "中西医结合特色三甲医院，提供中医适宜技术和综合专科门诊。",
      capabilities: ["中医科", "中西医结合", "慢病调理", "儿科", "内分泌科"],
    },
    {
      name: "成都高新区人民医院（四川大学华西高新医院）",
      type: InstitutionType.TERTIARY_HOSPITAL,
      level: "三甲",
      address: "一期已封顶，预计2026年全面建成",
      description: "规划建设中的高新区重大综合医疗资源，定位区域高水平综合医院。",
      capabilities: ["规划综合医院", "华西协同", "心血管内科", "内分泌科", "儿科"],
    },
    {
      name: "肖家河社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区兴蓉街4号",
      description: "提供全科诊疗、慢病随访、家庭医生和公共卫生服务。",
      capabilities: ["全科", "慢病管理", "家庭医生", "老年健康"],
    },
    {
      name: "芳草社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区创瑞街10号、泰和二街366号（分南/北区）",
      description: "覆盖芳草片区南北区的社区健康服务网络。",
      capabilities: ["全科", "儿童保健", "慢病管理", "康复随访"],
    },
    {
      name: "石羊社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区锦城大道1888号",
      description: "面向石羊片区居民提供基层医疗与慢病管理服务。",
      capabilities: ["全科", "慢病管理", "老年健康", "中医适宜技术"],
    },
    {
      name: "桂溪社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区昆华路1102号、天府三街1715号、天和路202号",
      description: "多点位社区卫生服务中心，覆盖桂溪片区居民健康管理。",
      capabilities: ["全科", "儿童保健", "老年健康", "慢病管理"],
    },
    {
      name: "永安社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区天长路79-81号",
      description: "提供社区常见病诊疗、慢病随访和康复服务。",
      capabilities: ["全科", "康复随访", "中医适宜技术", "家庭医生"],
    },
    {
      name: "中和社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区中和大道三段56号（北区）、中和应龙北二路1105号（南区）",
      description: "中和片区南北区社区卫生服务中心。",
      capabilities: ["全科", "慢病管理", "儿童保健", "老年健康"],
    },
    {
      name: "合作社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区清源环街171号",
      description: "面向合作片区居民提供基层诊疗和公共卫生服务。",
      capabilities: ["全科", "慢病管理", "家庭医生", "康复随访"],
    },
    {
      name: "西园社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区尚雅路216号",
      description: "面向高新西园居民提供全科和慢病管理服务。",
      capabilities: ["全科", "慢病管理", "老年健康", "中医适宜技术"],
    },
    {
      name: "南新社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区天晖路36号",
      description: "提供社区全科、儿童保健和康复随访服务。",
      capabilities: ["全科", "儿童保健", "康复随访", "家庭医生"],
    },
    {
      name: "新北社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区新乐路168号",
      description: "新北片区社区卫生服务中心，提供常见病与慢病服务。",
      capabilities: ["全科", "慢病管理", "老年健康", "家庭医生"],
    },
    {
      name: "锦城社区卫生服务中心",
      type: InstitutionType.COMMUNITY_HEALTH_CENTER,
      level: "社区卫生服务中心",
      address: "高新区锦尚西二路333号",
      description: "锦城片区居民健康服务入口，覆盖全科和公共卫生服务。",
      capabilities: ["全科", "慢病管理", "儿童保健", "中医适宜技术"],
    },
  ]

  const institutions = new Map<string, Awaited<ReturnType<typeof prisma.institution.create>>>()

  for (const item of institutionConfigs) {
    const institution = await prisma.institution.create({
      data: {
        ...item,
        capabilities: json(item.capabilities),
      },
    })
    institutions.set(institution.name, institution)
  }

  return institutions
}

async function seedDepartments(
  institutions: Map<string, Awaited<ReturnType<typeof prisma.institution.create>>>
) {
  const hospitalDepartments = new Map<string, string[]>([
    ["成都市第一人民医院（成都市中西医结合医院）", ["心血管内科", "呼吸内科", "儿科", "消化内科", "中医科"]],
    ["成都上锦南府医院", ["心血管内科", "呼吸内科", "儿科", "消化内科", "内分泌科"]],
    ["四川现代医院（高新院区）", ["心血管内科", "呼吸内科", "儿科", "消化内科", "内分泌科"]],
    ["四川省中西医结合医院高新医院（成都高新区中医医院）", ["心血管内科", "儿科", "内分泌科", "中医科", "康复医学科"]],
    ["成都高新区人民医院（四川大学华西高新医院）", ["心血管内科", "呼吸内科", "儿科", "消化内科", "内分泌科"]],
  ])
  const communityDepartments = ["全科", "慢病管理", "儿童保健", "老年健康", "康复随访", "中医适宜技术"]
  const departmentMap = new Map<string, Awaited<ReturnType<typeof prisma.department.create>>>()

  for (const institution of institutions.values()) {
    const names =
      institution.type === InstitutionType.TERTIARY_HOSPITAL
        ? mustGet(hospitalDepartments, institution.name)
        : communityDepartments

    for (const name of names) {
      const department = await prisma.department.create({
        data: {
          institutionId: institution.id,
          name,
          description: `${institution.name}${name}服务单元`,
          symptomKeywords: json(keywordByDepartment(name, "symptom")),
          diseaseKeywords: json(keywordByDepartment(name, "disease")),
        },
      })
      departmentMap.set(`${institution.name}:${name}`, department)

      if (institution.type === InstitutionType.COMMUNITY_HEALTH_CENTER) {
        await prisma.serviceCapability.create({
          data: {
            institutionId: institution.id,
            departmentId: department.id,
            name,
            category: name === "慢病管理" ? "慢病服务" : "基层服务",
            description: `${institution.name}提供${name}相关服务。`,
            keywords: json(keywordByDepartment(name, "symptom")),
          },
        })
      }
    }
  }

  return departmentMap
}

function keywordByDepartment(name: string, type: "symptom" | "disease") {
  const keywords: Record<string, { symptom: string[]; disease: string[] }> = {
    心血管内科: {
      symptom: ["胸痛", "胸闷", "心悸", "气短"],
      disease: ["冠心病", "高血压", "心绞痛", "心肌梗死"],
    },
    呼吸内科: {
      symptom: ["咳嗽", "发热", "气促", "咳痰"],
      disease: ["肺炎", "支气管炎", "哮喘", "慢阻肺"],
    },
    儿科: {
      symptom: ["儿童发热", "咳嗽", "腹泻", "皮疹"],
      disease: ["上呼吸道感染", "手足口病", "支气管炎", "胃肠炎"],
    },
    消化内科: {
      symptom: ["腹痛", "腹泻", "恶心", "呕吐"],
      disease: ["胃炎", "肠炎", "消化不良", "胆囊炎"],
    },
    内分泌科: {
      symptom: ["血糖偏高", "口渴", "多尿", "体重变化"],
      disease: ["糖尿病", "高脂血症", "甲状腺疾病", "代谢综合征"],
    },
    中医科: {
      symptom: ["乏力", "失眠", "慢病调理", "疼痛"],
      disease: ["慢性病调理", "亚健康", "颈肩腰腿痛", "脾胃病"],
    },
    康复医学科: {
      symptom: ["术后康复", "运动障碍", "疼痛", "功能恢复"],
      disease: ["脑卒中恢复期", "骨关节病", "慢性疼痛", "术后康复"],
    },
    全科: {
      symptom: ["头痛", "发热", "咳嗽", "复诊"],
      disease: ["常见病", "多发病", "慢性病", "健康咨询"],
    },
    慢病管理: {
      symptom: ["血压波动", "血糖偏高", "复诊开药", "随访"],
      disease: ["高血压", "糖尿病", "高脂血症", "慢阻肺"],
    },
    儿童保健: {
      symptom: ["儿童发热", "生长发育", "疫苗咨询", "儿童咳嗽"],
      disease: ["儿童常见病", "营养问题", "发育迟缓", "上呼吸道感染"],
    },
    老年健康: {
      symptom: ["头晕", "乏力", "跌倒风险", "慢病复诊"],
      disease: ["高血压", "糖尿病", "骨质疏松", "老年综合征"],
    },
    康复随访: {
      symptom: ["功能恢复", "术后随访", "疼痛", "行动不便"],
      disease: ["术后康复", "脑卒中恢复期", "骨关节病", "慢性疼痛"],
    },
    中医适宜技术: {
      symptom: ["慢性疼痛", "失眠", "乏力", "调理"],
      disease: ["颈肩腰腿痛", "慢病调理", "亚健康", "脾胃病"],
    },
  }

  return keywords[name]?.[type] ?? [name]
}

async function seedDoctors(
  institutions: Map<string, Awaited<ReturnType<typeof prisma.institution.create>>>,
  departments: Map<string, Awaited<ReturnType<typeof prisma.department.create>>>
) {
  const doctorConfigs = [
    ["成都市第一人民医院（成都市中西医结合医院）", "心血管内科", "周启明", "主任医师", ["胸痛", "冠心病", "高血压急症"], true],
    ["成都市第一人民医院（成都市中西医结合医院）", "儿科", "赵雨", "副主任医师", ["儿童发热", "呼吸道感染", "儿童急诊"], false],
    ["成都上锦南府医院", "呼吸内科", "杨帆", "主任医师", ["发热咳嗽", "肺炎", "慢阻肺"], true],
    ["成都上锦南府医院", "内分泌科", "唐敏", "副主任医师", ["糖尿病", "血糖异常", "甲状腺疾病"], false],
    ["四川现代医院（高新院区）", "消化内科", "刘海", "副主任医师", ["腹痛腹泻", "胃肠炎", "消化道疾病"], false],
    ["四川现代医院（高新院区）", "心血管内科", "孙洁", "主任医师", ["胸闷胸痛", "心律失常", "高血压"], true],
    ["四川省中西医结合医院高新医院（成都高新区中医医院）", "中医科", "何文中", "主任中医师", ["慢病调理", "中西医结合", "中医适宜技术"], true],
    ["四川省中西医结合医院高新医院（成都高新区中医医院）", "儿科", "蒋蓉", "主治医师", ["儿童发热", "儿童咳嗽", "中西医儿科"], false],
    ["成都高新区人民医院（四川大学华西高新医院）", "心血管内科", "郭立", "主任医师", ["胸痛中心", "冠心病", "高血压"], true],
    ["成都高新区人民医院（四川大学华西高新医院）", "内分泌科", "钟宁", "主任医师", ["糖尿病", "肥胖代谢", "体检异常"], true],
    ["肖家河社区卫生服务中心", "慢病管理", "陈晓", "全科副主任医师", ["高血压随访", "糖尿病管理", "家庭医生"], false],
    ["芳草社区卫生服务中心", "全科", "林青", "全科主治医师", ["常见病", "复诊开药", "家庭医生"], false],
    ["石羊社区卫生服务中心", "老年健康", "吴军", "全科主治医师", ["老年慢病", "高血压", "健康评估"], false],
    ["桂溪社区卫生服务中心", "儿童保健", "罗萍", "主治医师", ["儿童保健", "儿童发热初筛", "疫苗咨询"], false],
    ["永安社区卫生服务中心", "康复随访", "马强", "康复医师", ["术后康复", "慢性疼痛", "功能训练"], false],
    ["中和社区卫生服务中心", "慢病管理", "黄丽", "全科主治医师", ["高血压", "糖尿病", "慢病随访"], false],
    ["合作社区卫生服务中心", "全科", "周琴", "全科医师", ["常见病", "咳嗽发热", "腹痛腹泻"], false],
    ["西园社区卫生服务中心", "慢病管理", "谢涛", "全科主治医师", ["高血压复诊", "血糖管理", "健康教育"], false],
    ["南新社区卫生服务中心", "儿童保健", "冯静", "儿保医师", ["儿童发热", "儿童保健", "生长发育"], false],
    ["锦城社区卫生服务中心", "中医适宜技术", "郑梅", "中医师", ["慢病调理", "中医适宜技术", "失眠调理"], false],
  ] as const

  const doctors = new Map<string, Awaited<ReturnType<typeof prisma.doctor.create>>>()

  for (const [institutionName, departmentName, name, title, specialties, isExpert] of doctorConfigs) {
    const institution = mustGet(institutions, institutionName)
    const department = mustGet(departments, `${institutionName}:${departmentName}`)
    const doctor = await prisma.doctor.create({
      data: {
        institutionId: institution.id,
        departmentId: department.id,
        name,
        title,
        specialties: json(specialties),
        isExpert,
        introduction: `${name}${title}，擅长${specialties.join("、")}。`,
      },
    })
    doctors.set(name, doctor)

    if (isExpert) {
      await prisma.expertPool.create({
        data: {
          doctorId: doctor.id,
          poolName: "高新区专科专家池",
          specialtyArea: departmentName,
          tags: json(specialties),
          priority: 10,
        },
      })
    }
  }

  await prisma.user.create({
    data: {
      role: Role.DOCTOR,
      displayName: "周启明",
      phone: "13900001001",
      doctorProfile: {
        create: {
          doctorId: mustGet(doctors, "周启明").id,
          name: "周启明",
          title: "主任医师",
          phone: "13900001001",
        },
      },
    },
  })

  return doctors
}

async function seedResidents() {
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

async function seedResidentHealthData(
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

async function seedOperationalDemoData(
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

async function seedRulesAndKnowledge() {
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

async function seedSessions(
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

async function main() {
  await resetDatabase()
  const institutions = await seedInstitutions()
  const departments = await seedDepartments(institutions)
  const doctors = await seedDoctors(institutions, departments)
  const residents = await seedResidents()
  await seedResidentHealthData(residents)
  await seedOperationalDemoData(residents, institutions, departments)
  await seedRulesAndKnowledge()
  await seedSessions(residents, institutions, departments, doctors)

  console.log("Seed 完成：已写入高新区 Mock 医疗资源、居民健康档案、规则、知识库与 Agent 日志。")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
