import Link from "next/link"
import {
  Activity,
  Bot,
  Building2,
  Database,
  GitBranch,
  Hospital,
  Lightbulb,
  MessageCircleWarning,
  Settings2,
  Stethoscope,
  UserRoundCog,
  Video,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "运行驾驶舱", icon: Activity },
  { href: "/admin/institutions", label: "机构管理", icon: Building2 },
  { href: "/admin/departments", label: "科室管理", icon: Hospital },
  { href: "/admin/doctors", label: "医生管理", icon: UserRoundCog },
  { href: "/admin/rules", label: "分诊规则", icon: GitBranch },
  { href: "/admin/knowledge", label: "知识库", icon: Database },
  { href: "/admin/videos", label: "视频推荐", icon: Video },
  { href: "/admin/agent-runs", label: "Agent 日志", icon: Bot },
  { href: "/admin/intent-insights", label: "意图洞察", icon: Lightbulb },
  { href: "/admin/quality", label: "质量反馈", icon: MessageCircleWarning },
  { href: "/admin/model-config", label: "模型配置", icon: Settings2 },
]

export function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-700 text-white">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">卫健管理端</p>
            <p className="text-xs text-slate-500">健康高新运行管理后台</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item, index) => {
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                index === 0
                  ? "bg-indigo-50 text-indigo-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
