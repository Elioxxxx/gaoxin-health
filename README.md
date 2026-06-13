# 成都高新区全民健康档案与智能导诊平台

## 最终可运行命令

```bash
pnpm install
pnpm db:generate
pnpm db:migrate -- --name init
pnpm db:seed
pnpm dev
```

## 验收命令

```bash
pnpm db:seed
pnpm operational-demo-check
pnpm final-check
pnpm gaoxin-check
pnpm lint
pnpm typecheck
pnpm build
```

其中 `pnpm gaoxin-check` 会验证融合版所需基础数据，并自动跑通胸闷胸痛、高血压复诊、儿童发热、体检血糖偏高四个演示闭环。

`pnpm operational-demo-check` 会验证运营演示增强包，包括 16 个患者案例、医生版健康档案、用户行为事件、意图洞察、服务线索和重点患者数据完整性。

## 产品设计与模块说明

后续迭代、模块拆分和公网部署前，建议先阅读：

- [产品设计与模块说明](docs/product-design-and-module-map.md)
- [生产化架构优化方案](docs/production-architecture-plan.md)
- [PostgreSQL 生产数据库迁移方案](docs/postgresql-migration-plan.md)
- [阿里云/火山云 ECS 部署说明](docs/deployment-ecs.md)

## 项目简介

本项目是“健康高新”官方居民健康服务入口的 Web/H5 MVP 原型，演示居民智能预问诊、健康档案摘要、P0-P4 分诊、医疗资源推荐、导诊指引、医生反馈和卫健管理端运行治理闭环。

## 业务背景

客户场景面向成都市高新区卫健委。第一版不接入真实微信小程序、HIS、省卫健数据、真实挂号、支付、语音识别或医学影像识别，全部使用 Mock 居民、Mock 病历和 Mock AI 输出，便于演示和后续扩展。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma + SQLite
- Recharts
- lucide-react
- zod、react-hook-form、zustand
- Mock AI Provider

## 目录结构

```text
src/app/gaoxin           高新健康融合版居民端
src/app/doctor           医生端工作台
src/app/admin            卫健管理端
src/app/api              API Route Handlers
src/components/gaoxin    融合版小程序风组件
src/components/doctor    医生端组件
src/components/admin     管理端组件
src/lib/ai               AI Provider 与 Agent
src/lib/pre-consult      预问诊会话与 Agent 编排入口
src/lib/health-record    健康档案展示适配入口
src/lib/resource         医疗资源展示适配入口
src/lib/recommendation   推荐算法入口
src/lib/intent           行为、意图与服务线索
src/lib/admin            卫健统计聚合
src/lib/rules            分诊规则引擎兼容层
src/lib/matching         医疗资源匹配算法兼容层
src/lib/db               Prisma Client
src/server/queries       服务端聚合查询
src/server/mutations     服务端写入操作
prisma/seed.ts           Seed 编排入口
prisma/seed              机构、居民、运营案例、知识库、预问诊演示 Seed 模块
prisma                   Schema、Migration、Seed
scripts                  smoke 与 final-check 脚本
deploy                   ECS 部署脚本、Nginx 和 systemd 示例
docs/deployment-ecs.md   阿里云/火山云 ECS 部署手册
```

## 本地启动

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000。如果端口被占用，Next.js 会自动使用其他端口。

## 阿里云 ECS 发布

当前公网演示默认发布到阿里云 ECS。代码先推送到 GitHub `main` 分支，再由 ECS 拉取最新代码、安装依赖、执行数据库迁移、构建并重启 systemd 服务。

发布前请先做本地验证和秘密信息检查，确认 `.env`、数据库文件、SSH Key、云厂商密钥、Token 等不会进入 Git：

```bash
pnpm lint
pnpm typecheck
pnpm build
git status --short
git diff --cached --check
```

ECS 默认目录和服务：

- 代码目录：`/opt/gaoxin-health/current`
- SQLite 数据库：`/opt/gaoxin-health/data/gaoxin-health.db`
- systemd 服务：`gaoxin-health.service`
- Nginx：公网 80 反向代理到 `127.0.0.1:3000`

常规发布流程详见 [阿里云/火山云 ECS 部署说明](docs/deployment-ecs.md)。

## 数据库初始化

```bash
pnpm db:generate
pnpm db:migrate -- --name init
pnpm db:seed
```

如果当前 pnpm script 对 `-- --name init` 不兼容，可使用：

```bash
pnpm exec prisma migrate dev --name init
```

## 演示路径

- `/`：系统入口与四个演示场景
- `/gaoxin`：高新健康融合版居民端首页
- `/gaoxin/ai`：小高健康助手
- `/gaoxin/pre-consult`：智能预问诊
- `/gaoxin/health-record`：全民健康档案
- `/gaoxin/resources`：医疗资源
- `/gaoxin/health-management`：健康管理
- `/gaoxin/records`：我的记录
- `/doctor`：医生工作台
- `/doctor/schedule`：今日接诊
- `/admin`：卫健运行驾驶舱
- `/admin/agent-runs`：Agent 日志
- `/admin/quality`：质量反馈

## 四个演示居民

1. 张建国：66 岁，男，高血压，胸闷胸痛 2 小时，演示 P0/P1 高风险分诊和三甲专家推荐。
2. 李秀兰：58 岁，女，高血压复诊，演示 P3 社区卫生服务中心和家庭医生承接。
3. 王小宝：5 岁，男，儿童发热 1 天，演示 P2 儿科或综合医院推荐。
4. 陈明：42 岁，男，体检血糖偏高，演示 P3/P4 慢病管理或内分泌门诊推荐。

## 核心业务闭环

居民进入健康高新入口，发起智能预问诊；系统结构化追问并生成预问诊报告；结合历史就诊记录生成健康档案摘要；规则引擎判断 P0-P4 分诊等级；资源匹配算法推荐医院、科室、医生或社区卫生服务中心；生成导诊指引；医生端查看报告并提交反馈；卫健端查看运行驾驶舱、Agent 日志和质量问题。

## 高新健康融合版居民端

### 设计定位

`/gaoxin` 是在现有“健康高新”小程序服务大厅板式基础上接入本次 AI 能力的融合版居民端。它保留高频服务、电子健康卡、个人中心等小程序形态，同时新增“小高健康助手”、AI导诊、报告解读、全民健康档案、导诊指引、我的记录和健康管理。

### 路由说明

- `/gaoxin`：融合版首页，展示 Banner、高频服务、电子健康卡、小高健康助手和服务大厅。
- `/gaoxin/ai`：AI健康页，展示问候区、健康摘要、快捷能力、推荐问题和底部输入框。
- `/gaoxin/mine`：个人中心，展示个人信息、电子健康卡、我的记录、我的健康数据和常用工具。
- `/gaoxin/pre-consult`：融合版智能预问诊。
- `/gaoxin/pre-consult/[id]/result`：融合版分诊推荐结果。
- `/gaoxin/guide/[id]`：融合版导诊指引。
- `/gaoxin/health-record`：全民健康档案。
- `/gaoxin/resources`：医疗资源。
- `/gaoxin/report-ai`：AI报告解读演示页。
- `/gaoxin/health-management`：健康管理。
- `/gaoxin/records`：我的记录。

### 三个一级页面

- 首页：模拟现有健康高新小程序首页，加入小高健康助手和四个演示入口。
- AI健康：承接症状咨询、报告问题、健康档案摘要和导诊推荐。
- 我的：承接个人中心、电子健康卡、AI问诊记录、导诊记录和健康数据。

### 四个演示场景

1. 胸闷胸痛：`/gaoxin/pre-consult?demo=chest-pain`，预期 P0/P1，推荐三甲医院心血管内科和专家池医生。
2. 高血压复诊：`/gaoxin/pre-consult?demo=hypertension`，预期 P3，推荐社区卫生服务中心和慢病管理。
3. 儿童发热：`/gaoxin/pre-consult?demo=child-fever`，预期 P2，推荐儿科或综合医院。
4. 体检血糖偏高：`/gaoxin/pre-consult?demo=blood-sugar`，预期 P3/P4，推荐慢病管理或内分泌方向。

### 本地演示步骤

```bash
pnpm install
pnpm db:generate
pnpm db:migrate -- --name init
pnpm db:seed
pnpm dev
```

打开 `/gaoxin`，点击“小高健康助手”中的演示入口，完成智能预问诊、分诊推荐、导诊指引，并在 `/gaoxin/records`、`/gaoxin/health-record`、`/gaoxin/health-management` 查看记录和健康数据。

### 与旧原型居民端的关系

- 旧 `/app` 原型居民端已下线，并从代码中移除。
- `/gaoxin` 是当前唯一居民端产品线，用于演示融合现有健康高新小程序板式后的最终产品形态。
- `/doctor` 和 `/admin` 保持不变，融合版居民端生成的预问诊 session 仍会进入医生工作台和卫健管理端数据。

### 启动命令

```bash
pnpm install
pnpm db:generate
pnpm db:migrate -- --name init
pnpm db:seed
pnpm dev
```

### 验收命令

```bash
pnpm db:seed
pnpm gaoxin-check
pnpm lint
pnpm typecheck
pnpm build
```

## Mock AI Provider 说明

当前只启用 `MockAiProvider`。它根据输入内容确定性识别胸痛、高血压复诊、儿童发热、血糖偏高、咳嗽发热、腹痛腹泻等场景，便于稳定演示。代码已预留 OpenAI、豆包、火山和私有化模型 Provider 扩展入口，但未接入真实模型。

## 运营演示增强包

### 增强目标

运营演示增强包用于展示三件事：大量零散患者记录如何被系统整理成健康档案，医生如何看到专业的医生版健康档案和风险关注点，卫健端如何基于居民行为形成区域健康需求洞察和服务线索。

本增强包仍然只使用 Mock 数据，不接真实 HIS、省卫健数据、真实用户行为埋点或真实身份认证。

### 16 个患者案例说明

当前种子数据包含 16 个居民案例。原有 4 个核心演示居民为：

- 张建国：高血压、胸闷胸痛、心血管专科就医。
- 李秀兰：高血压复诊、社区慢病管理、家庭医生承接。
- 王小宝：儿童发热、儿科或综合医院推荐。
- 陈明：体检血糖偏高、慢病管理或内分泌方向。

新增 12 个运营演示患者覆盖：

- 赵德全：慢阻肺/COPD、反复咳喘、社区康复。
- 刘桂芳：糖尿病、糖化血红蛋白偏高、尿微量白蛋白异常。
- 周敏：孕期咨询、贫血、产检记录。
- 黄俊：失眠焦虑、反复健康咨询。
- 杨帆：脂肪肝、高尿酸、肥胖。
- 吴强：胃痛反复、幽门螺杆菌阳性。
- 郑梅：骨质疏松、跌倒风险、老年健康。
- 孙磊：青霉素过敏、咳嗽发热、抗生素反复咨询。
- 唐蓉：甲状腺结节、报告焦虑、专科复查建议。
- 罗成：脑梗既往史、血压波动、卒中二级预防。
- 蒋丽：乳腺结节、体检异常、妇女健康。
- 何伟：发热咳嗽、抗生素搜索、呼吸/全科分诊。

每个运营案例包含跨机构就诊记录、诊断、用药、检查检验、过敏或禁忌、健康标签、医生版健康档案、用户行为事件、意图洞察和服务线索。

### 医生版健康档案说明

医生端患者详情中增加了医生版健康档案能力，用于把医院、社区卫生服务中心、体检报告、随访记录和用户行为整理为一页式摘要。医生可以查看：

- 一页式健康摘要
- 主要健康问题
- 本次就诊相关重点
- 医生核实清单
- 数据来源
- 跨机构记录时间线
- 检查检验趋势
- 用药与禁忌
- 行为意图分析

### 风险提示与医生关注点分类

医生端会按专业类别展示风险提示与医生关注点：

- 急性风险与就诊优先级
- 慢病与长期控制
- 用药安全与过敏禁忌
- 特殊体质/特殊人群
- 检查检验异常与趋势
- 既往重大病史与手术史
- 生活方式与行为风险
- 就医行为与依从性
- 公卫/随访/筛查提示
- 数据质量与待核实信息

这些内容只在医生端和卫健端展示。居民端保持友好表达，不展示内部风险等级、算法评分或专业判断结论。

### 用户行为与意图识别说明

系统通过 Mock 行为事件模拟居民在融合版居民端的动作，例如 AI 咨询、搜索健康问题、查看报告、查看医疗资源、生成导诊后未预约、查看健康档案和健康任务。

意图引擎使用规则 + Mock LLM 摘要生成以下服务意图：

- 急性就医意图
- 专科就医意图
- 慢病管理意图
- 报告解读意图
- 家医签约意图
- 儿童健康意图
- 孕产妇健康意图
- 老年健康意图
- 健康焦虑意图
- 服务中断/就医延迟
- 用药安全意图
- 公卫随访意图

### 医院线索、社区线索、卫健洞察说明

服务线索按接收对象分为：

- 医院线索：适合专科接诊、急性就医、报告异常复核、导诊未预约等场景。
- 社区线索：适合高血压、糖尿病、家医签约、老年健康、康复随访、体检异常管理等场景。
- 卫健洞察：适合区域高频问题、科普推送建议、资源配置建议和医院/社区协同治理。

医生端 `/doctor/service-leads` 可查看医院和社区可承接的服务线索；卫健端 `/admin/intent-insights` 可查看区域健康需求洞察、热门意图排行、线索流向和线索明细。

### 运营演示路径

居民端：

- `/gaoxin`
- `/gaoxin/ai`
- `/gaoxin/health-record`
- `/gaoxin/pre-consult?demo=chest-pain`
- `/gaoxin/records`

医生端：

- `/doctor`
- `/doctor/service-leads`
- `/doctor/patients/[id]`

卫健端：

- `/admin`
- `/admin/intent-insights`

### 运营演示验收命令

```bash
pnpm db:seed
pnpm patient-demo-check
pnpm intent-demo-check
pnpm operational-demo-check
pnpm gaoxin-check
pnpm final-check
pnpm lint
pnpm typecheck
pnpm build
```

## 后续可扩展项

- 真实微信小程序
- 真实省卫健数据接口
- HIS/EMR/LIS/PACS 接口
- 真实挂号
- 真实大模型 Provider
- 向量知识库
- 真实身份认证
- 生产级权限与审计

## 完整验收命令

```bash
pnpm db:seed
pnpm operational-demo-check
pnpm final-check
pnpm gaoxin-check
pnpm lint
pnpm typecheck
pnpm build
```
