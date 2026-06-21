import {
  Activity,
  Baby,
  BadgeHelp,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Eye,
  FileClock,
  FileHeart,
  HandHeart,
  HeartPulse,
  Hospital,
  Landmark,
  Microscope,
  NotebookTabs,
  Pill,
  ReceiptText,
  ShieldPlus,
  Smartphone,
  Stethoscope,
  Syringe,
  UsersRound,
  WalletCards,
} from "lucide-react"

import { GaoxinBanner } from "@/components/gaoxin/gaoxin-banner"
import { GaoxinQuickActions } from "@/components/gaoxin/gaoxin-quick-actions"
import { GaoxinServiceSection } from "@/components/gaoxin/gaoxin-service-section"

const outpatientServices = [
  { label: "预约挂号", href: "/gaoxin/resources", icon: CalendarCheck, tone: "emerald" as const },
  { label: "在线缴费", href: "/gaoxin/records?type=payment", icon: CreditCard, tone: "cyan" as const },
  { label: "挂号记录", href: "/gaoxin/records?type=registration", icon: ClipboardList, tone: "sky" as const },
  { label: "缴费记录", href: "/gaoxin/records?type=payment", icon: ReceiptText, tone: "amber" as const },
]

const familyDoctorServices = [
  { label: "家医签约", href: "/gaoxin/health-management", icon: HandHeart, tone: "emerald" as const },
  { label: "健康档案", href: "/gaoxin/health-record", icon: FileHeart, tone: "cyan" as const },
  { label: "签约记录", href: "/gaoxin/records?type=family-doctor", icon: NotebookTabs, tone: "sky" as const },
  { label: "随访记录", href: "/gaoxin/records?type=follow-up", icon: FileClock, tone: "amber" as const },
]

const aiHealthServices = [
  { label: "AI导诊", href: "/gaoxin/pre-consult", icon: Stethoscope, tone: "emerald" as const },
  { label: "报告解读", href: "/gaoxin/report-ai", icon: Microscope, tone: "violet" as const },
  { label: "健康档案摘要", href: "/gaoxin/health-record", icon: FileHeart, tone: "cyan" as const },
  { label: "找医院医生", href: "/gaoxin/resources", icon: Hospital, tone: "sky" as const },
]

const vaccineServices = [
  { label: "九价预约", href: "/gaoxin/records?type=vaccine", icon: Syringe, tone: "emerald" as const },
  { label: "预约记录", href: "/gaoxin/records?type=vaccine-record", icon: ClipboardList, tone: "cyan" as const },
  { label: "九价申诉", href: "/gaoxin/records?type=vaccine-appeal", icon: BadgeHelp, tone: "amber" as const },
  { label: "疫苗接种门诊", href: "/gaoxin/records?type=vaccine-clinic", icon: ShieldPlus, tone: "sky" as const },
]

const bodyCheckServices = [
  { label: "血压记录", href: "/gaoxin/health-management?tab=blood-pressure", icon: HeartPulse, tone: "emerald" as const },
  { label: "血糖记录", href: "/gaoxin/health-management?tab=blood-sugar", icon: Activity, tone: "cyan" as const },
  { label: "智能随访", href: "/gaoxin/health-management?tab=follow-up", icon: UsersRound, tone: "sky" as const },
  { label: "健康体测", href: "/gaoxin/health-management?tab=body-check", icon: Smartphone, tone: "violet" as const },
]

const convenienceServices = [
  { label: "医院介绍", href: "/gaoxin/resources", icon: Building2, tone: "emerald" as const },
  { label: "药品信息", href: "/gaoxin/records?type=medicine", icon: Pill, tone: "cyan" as const },
  { label: "眼健康档案", href: "/gaoxin/health-record?topic=eye", icon: Eye, tone: "sky" as const },
]

const thirdPartyServices = [
  { label: "高新妇幼", href: "/gaoxin/records?type=maternal-child", icon: Baby, tone: "emerald" as const },
  { label: "微网实格", href: "/gaoxin/records?type=grid-service", icon: Landmark, tone: "cyan" as const },
  { label: "医疗保障", href: "/gaoxin/records?type=insurance", icon: WalletCards, tone: "sky" as const },
]

const headlines = [
  "胸闷胸痛不适，建议尽快评估心血管风险",
  "高血压复诊可优先联系社区卫生服务中心",
  "体检血糖偏高，建议建立健康管理任务",
]

export function GaoxinHomeClient() {
  return (
    <div className="space-y-3 pb-2">
      <GaoxinBanner />
      <GaoxinQuickActions />
      <GaoxinServiceSection title="门诊服务" items={outpatientServices} />
      <GaoxinServiceSection title="家医服务" items={familyDoctorServices} />
      <GaoxinServiceSection title="AI健康服务" items={aiHealthServices} highlight badge="新增" />
      <GaoxinServiceSection title="疫苗服务" items={vaccineServices} />
      <GaoxinServiceSection title="智能体测" items={bodyCheckServices} />
      <GaoxinServiceSection title="便民服务" items={convenienceServices} />
      <GaoxinServiceSection title="第三方应用" items={thirdPartyServices} />
      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">健康头条</h2>
          <span className="text-xs text-emerald-600">健康建议</span>
        </div>
        <div className="space-y-2">
          {headlines.map((item, index) => (
            <div key={item} className="flex gap-2 rounded-2xl bg-slate-50 p-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                {index + 1}
              </span>
              <p className="text-sm leading-5 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
