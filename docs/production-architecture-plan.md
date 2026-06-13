# 生产化架构优化方案

本文档基于 `docs/product-design2.md` 和当前代码结构整理，目标是把 Demo 版本平滑推进到生产化开发。核心原则不是直接把 Mock 替换成真实 API，而是先补齐模型治理、真实数据接入、权限审计和前后端契约边界。

## 1. 当前结论

当前系统适合继续保持“模块化单体”形态，不建议立刻拆微服务。下一阶段应先新增三层边界：

1. **AI Gateway**：所有 Agent 通过统一网关调用大模型，负责 Provider 路由、超时、脱敏、降级、结构化输出和日志治理。
2. **Integration Gateway**：真实 HIS/EMR/LIS/PACS/公卫/挂号数据先进入接入反腐层，再映射到平台内部统一模型。
3. **Security Boundary**：真实身份、RBAC/ABAC、Consent、Audit、Privacy 先形成后端强约束，避免只靠前端隐藏字段。

## 2. 本轮已落地的地基

本轮先落地不影响演示流程的代码边界：

- `src/lib/config/runtime.ts`：统一读取运行环境、AI Provider、模型、数据源，并输出生产化配置检查。
- `src/lib/ai/gateway.ts`：新增 AI Gateway，支持超时、脱敏、真实 Provider 失败后降级 Mock。
- `src/lib/ai/provider.ts`：保留 Mock Provider，新增 OpenAI-Compatible Provider 骨架，可兼容 OpenAI、豆包/火山兼容接口、私有化模型网关。
- `src/integration/*`：新增医疗数据接入 Gateway 与 Canonical 类型，当前默认用 Mock Connector，后续真实接口只接入这里。
- `/admin/model-config`：展示当前 Provider、模型版本、数据源模式和生产化配置检查。

## 3. 推荐目标架构

```text
居民端 / 医生端 / 卫健端
        │
        ▼
Next.js BFF / API
  - zod 入参校验
  - 统一错误码
  - Auth/RBAC/ABAC
  - Consent/Audit/Privacy
        │
        ├── 领域服务层
        │   ├── 预问诊
        │   ├── 健康档案
        │   ├── 推荐导诊
        │   ├── 服务线索
        │   └── 质量反馈
        │
        ├── AI Gateway
        │   ├── Mock Provider
        │   ├── OpenAI-Compatible Provider
        │   ├── Domestic Model Provider
        │   ├── Private Model Provider
        │   └── Prompt/Model/Audit/Cost/Timeout/Fallback
        │
        └── Integration Gateway
            ├── HIS Connector
            ├── EMR Connector
            ├── LIS Connector
            ├── PACS Connector
            ├── Public Health Connector
            └── Appointment Connector
```

## 4. 大模型接入策略

### 4.1 Provider 路由

环境变量建议：

```bash
AI_PROVIDER="mock" # mock | openai | openai-compatible | doubao | volcengine | private
AI_BASE_URL="https://your-model-gateway/v1"
AI_API_KEY="不要提交到 Git"
AI_MODEL="your-model-name"
AI_TIMEOUT_MS="12000"
AI_FALLBACK_TO_MOCK="true"
```

真实模型接入时，不建议各 Agent 直接调用厂商 SDK。应统一走 `AiGateway`：

- 轻量模型：预问诊结构化采集。
- 强模型：健康档案摘要、报告解释文案。
- 规则优先：分诊等级、急症识别、医生/机构推荐。
- 降级策略：模型失败时使用规则/Mock/人工提示，不阻塞整个链路。

### 4.2 医疗安全边界

生产环境中，LLM 不应单独决定：

- 分诊等级
- 急症识别
- 禁忌风险
- 医生和机构最终推荐
- 诊断或治疗方案

LLM 主要承担：

- 自然语言结构化
- 摘要生成
- 居民友好解释
- 医生端辅助摘要
- 质量反馈归纳

## 5. 真实数据接入策略

真实数据不要直接写入页面查询或现有 Prisma include。建议分三层：

| 层级 | 作用 |
| --- | --- |
| Raw 原始层 | 保存外部系统原始 JSON、文件地址、同步批次，便于回放和排错 |
| Canonical 规范层 | 统一诊断、用药、检验、检查、机构、科室、医生、号源语义 |
| App 应用层 | 支撑三端页面、健康摘要、医生版健康档案、推荐导诊和线索 |

当前 `src/integration/types.ts` 已定义 Canonical 类型。后续接 HIS/EMR/LIS/PACS 时，新增 Connector 与 Mapper 即可，不应把外部字段散落到业务模块。

## 6. 后续优先级

### P0：生产化地基

- 迁移 PostgreSQL/MySQL。
- 给写接口补齐 zod 校验、统一错误码、幂等 requestId。
- 建立 Auth、RBAC、ABAC、Consent、Audit、Privacy 服务。
- 扩展 AgentRun：记录 provider、model、promptVersion、latency、token/cost、结构化校验结果。
- 居民端 DTO 与医生/卫健专业 DTO 后端分离，防止内部字段泄漏。

### P1：先接低风险真实数据

- 机构、科室、医生、服务能力。
- 社区卫生服务中心能力。
- 电子健康卡/居民身份绑定。
- LIS 结构化检验报告。
- 挂号意向和预约状态，不直接污染 Recommendation。

### P2：接真实模型

- 先接结构化采集、摘要、解释文案。
- 暂不让模型主导分诊等级和推荐决策。
- 建立模型调用看板：失败率、延迟、结构化校验失败、成本、医生反馈。

### P3：真实医疗闭环

- 预约挂号状态回写。
- 慢病随访闭环。
- 医生反馈训练集。
- RAG 知识库版本管理。
- 卫健监管指标和服务绩效闭环。

## 7. 下一轮建议任务

1. 设计 PostgreSQL 迁移方案，区分 Demo seed、Sandbox 数据和生产数据。
2. 给所有 POST/PUT API 补 zod schema、requestId 和统一错误码。
3. 新增 `src/lib/security/*`，先实现 Mock AuthContext、RBAC/ABAC 策略和 AuditLog 接口。
4. 扩展 `AgentRun` 或新增 `AiInvocation`，记录真实模型调用元数据。
5. 为 `src/integration` 增加一个示例 HIS/LIS Connector mock contract test。
