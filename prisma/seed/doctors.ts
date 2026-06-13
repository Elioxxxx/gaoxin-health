import { json, mustGet, prisma, Role } from "./shared"

export async function seedDoctors(
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
