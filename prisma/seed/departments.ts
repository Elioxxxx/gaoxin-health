import { InstitutionType, json, mustGet, prisma } from "./shared"

export async function seedDepartments(
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
