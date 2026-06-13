import Link from "next/link";
import { Activity, Baby, Building2, HeartPulse, Smartphone, Stethoscope, Syringe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { demoScenarios } from "@/lib/demo-scenarios";

const portals = [
  {
    href: "/gaoxin",
    title: "高新健康融合版",
    description: "模拟现有健康高新小程序接入小高健康助手后的融合居民端。",
    icon: Smartphone,
    badge: "居民端",
    cta: "查看高新健康融合版小程序",
  },
  {
    href: "/doctor",
    title: "医生端",
    description: "查看居民预问诊报告、健康档案摘要与历史就诊时间线。",
    icon: Stethoscope,
    badge: "工作台",
    cta: "进入医生端",
  },
  {
    href: "/admin",
    title: "卫健管理端",
    description: "查看运行驾驶舱、机构资源、Agent 日志与质量反馈。",
    icon: Building2,
    badge: "管理后台",
    cta: "进入卫健管理端",
  },
];

const gaoxinDemoKeyMap: Record<string, string> = {
  chest_pain_high_risk: "chest-pain",
  hypertension_followup: "hypertension",
  child_fever: "child-fever",
  high_glucose_exam: "blood-sugar",
};

export default function Home() {
  const scenarioIcons = [Activity, HeartPulse, Baby, Syringe];

  return (
    <main className="min-h-dvh bg-slate-100 px-5 py-10 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            MVP 原型
          </Badge>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-normal md:text-5xl">
            成都高新区全民健康档案与智能导诊平台
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            构建“健康高新”官方居民健康服务入口，第一阶段使用 Mock 数据演示居民、医生与卫健管理端核心闭环。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {portals.map((portal) => {
            const Icon = portal.icon;

            return (
              <Card key={portal.href} className="border-slate-200">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary">{portal.badge}</Badge>
                  </div>
                  <CardTitle>{portal.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {portal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={portal.href}
                    className={buttonVariants({ className: "w-full" })}
                  >
                    {portal.cta}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">演示场景</h2>
            <p className="mt-1 text-sm text-slate-600">
              点击任一居民场景，可进入高新健康融合版智能预问诊并自动填入症状描述。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {demoScenarios.map((scenario, index) => {
              const Icon = scenarioIcons[index];

              return (
                <Card key={scenario.key} className="border-slate-200">
                  <CardHeader>
                    <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{scenario.resident}</CardTitle>
                    <CardDescription className="leading-6">
                      {scenario.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-6 text-slate-600">
                      {scenario.description}
                    </p>
                    <Link
                      href={`/gaoxin/pre-consult?demo=${gaoxinDemoKeyMap[scenario.key] ?? scenario.key}&input=${encodeURIComponent(scenario.input)}`}
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full",
                      })}
                    >
                      进入场景
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
