import { InstitutionType, json, prisma } from "./shared"

export async function seedInstitutions() {
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
