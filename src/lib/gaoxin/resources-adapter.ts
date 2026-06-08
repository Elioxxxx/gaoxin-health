import { parseJsonArray } from "@/lib/json"

export type GaoxinInstitutionItem = {
  id: string
  name: string
  type: string
  typeLabel: string
  level: string
  address: string
  description: string
  capabilities: string[]
  departmentCount: number
  doctorCount: number
}

export type GaoxinDoctorItem = {
  id: string
  name: string
  title: string
  isExpert: boolean
  specialties: string[]
  institutionName: string
  departmentName: string
}

type InstitutionPayload = {
  id: string
  name: string
  type: string
  level: string
  address: string
  description: string
  capabilities?: string
  departments?: unknown[]
  doctors?: unknown[]
}

type DoctorPayload = {
  id: string
  name: string
  title: string
  isExpert: boolean
  specialties?: string
  institution?: { name?: string }
  department?: { name?: string }
}

export function adaptGaoxinInstitutions(items: InstitutionPayload[]): GaoxinInstitutionItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    typeLabel: item.type === "TERTIARY_HOSPITAL" ? "三甲医院" : "社区卫生服务中心",
    level: item.level,
    address: item.address,
    description: item.description,
    capabilities: parseJsonArray(item.capabilities).slice(0, 5),
    departmentCount: item.departments?.length ?? 0,
    doctorCount: item.doctors?.length ?? 0,
  }))
}

export function adaptGaoxinDoctors(items: DoctorPayload[]): GaoxinDoctorItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    title: item.title,
    isExpert: item.isExpert,
    specialties: parseJsonArray(item.specialties).slice(0, 4),
    institutionName: item.institution?.name ?? "高新区医疗机构",
    departmentName: item.department?.name ?? "全科",
  }))
}
