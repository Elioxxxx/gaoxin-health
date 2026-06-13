下一次迭代不要简单理解为“把 Mock AI Provider 换成真实大模型 API、把 Seed 数据换成真实数据”。更稳妥的生产化目标应当是：**先补一层大模型治理网关、一层真实数据接入网关、一层权限与审计边界，再逐步替换 Mock 能力**。当前系统的三端结构、领域服务目录、AgentRun/Feedback/QualityIssue 等模型已经具备较好的演示闭环基础，但文档也明确指出当前仍不接真实大模型、不接真实 HIS/EMR/LIS/PACS/省卫健接口、不做真实合规闭环，这些正是生产化前必须先扫清的架构障碍。

## 一、总体架构建议：从“演示型单体”升级为“模块化单体 + 双网关 + 可治理 AI 平台”

当前代码已经按 `/gaoxin`、`/doctor`、`/admin`、`src/lib/*`、`src/server/queries/*` 做了比较清晰的模块边界，生产化第一阶段更适合走**模块化单体**，先把边界、接口、审计、数据模型打牢。文档中也明确建议复杂查询继续收敛到 `src/server/queries/*`，避免页面层直接拼 Prisma include，这个方向是对的。

建议目标形态如下：

```text
居民端 / 医生端 / 卫健端
        │
        ▼
BFF / API 层
- 统一认证
- zod 入参校验
- RBAC/ABAC 权限判断
- API 版本兼容
        │
        ├──────────────► 领域服务层
        │                 - 预问诊
        │                 - 健康档案
        │                 - 医疗资源
        │                 - 导诊推荐
        │                 - 服务线索
        │                 - 质量反馈
        │
        ├──────────────► 大模型治理网关
        │                 - Provider 适配
        │                 - Prompt/模型版本
        │                 - RAG 检索
        │                 - 输出结构校验
        │                 - 脱敏与安全拦截
        │                 - 成本、延迟、错误、回放
        │
        ├──────────────► 真实数据接入网关
        │                 - HIS / EMR / LIS / PACS / 挂号 / 电子健康卡
        │                 - 统一患者主索引
        │                 - 数据清洗、去重、标准化
        │                 - 来源、时间、可信度、授权记录
        │
        ▼
生产数据层
- OLTP 主库：PostgreSQL / MySQL
- JSONB / 结构化表
- 向量库 / 检索库
- 对象存储：报告、图片、附件
- 审计日志库
- 指标与质量分析库
```

这套架构的核心是把两个高风险变化隔离出来：**大模型 API 不直接进入业务页面，真实医疗数据不直接进入现有 Prisma 查询**。二者都先通过治理层适配，再进入领域服务。

---

## 二、大模型接入优化：不要只替换 `MockAiProvider`，要建设“AI Gateway + Agent Orchestrator”

当前文档中 `src/lib/ai/provider.ts` 已经有 AI Provider 抽象，`src/lib/ai/agents/` 中也有预问诊、健康摘要、报告、分诊、推荐、导诊、随访、质量 Agent，这是非常好的切入点。 但生产环境里，真实大模型会带来延迟、费用、幻觉、非结构化输出、隐私外发、供应商不可用、版本漂移等问题，所以建议新增一个独立的 `AiGateway`，不要让各个 Agent 直接调模型厂商 SDK。

### 1. Provider 层升级为多模型、多策略网关

建议把现在的 `MockAiProvider` 扩展为：

```text
AiProvider
├─ MockAiProvider
├─ OpenAICompatibleProvider
├─ DomesticModelProvider
├─ PrivateDeploymentProvider
└─ RuleOnlyProvider / FallbackProvider
```

网关层需要统一处理这些能力：

| 能力          | 目的                                   |
| ----------- | ------------------------------------ |
| 模型路由        | 不同 Agent 使用不同模型，如结构化采集用轻量模型，报告总结用强模型 |
| 超时控制        | 医疗场景不能让居民一直等待，需要快速失败和降级              |
| 重试与熔断       | 模型接口失败时降级到规则、历史摘要或人工提示               |
| 请求限流        | 防止恶意刷接口和费用失控                         |
| 成本统计        | 按居民、机构、Agent、模型版本统计 token 和调用成本      |
| 输出结构校验      | LLM 输出必须经过 zod/json schema 校验后入库     |
| Prompt 版本管理 | 每次结果可追溯到 PromptTemplate、ModelVersion |
| 脱敏与最小化上下文   | 不把完整健康档案原文无差别发送给模型                   |
| 结果回放        | AgentRun 可以复盘输入、检索内容、模型、输出、错误        |

文档中已有 `PromptTemplate`、`ModelVersion`、`AgentRun`、`AgentStep`、`AgentFeedback`、`QualityIssue`，建议下一步围绕这些模型做生产化增强，而不是重写 Agent。

### 2. Agent 链路改为“状态机 + 可恢复任务”

当前预问诊链路是从居民输入到结构化采集、健康摘要、报告生成、规则分诊、推荐、导诊、随访，再写入 Report/Triage/Recommendation/GuidePlan/HealthTask/AgentRun。 这个链路生产化后不宜做成一个同步长请求，否则模型慢、数据源慢、某一步失败都会拖垮体验。

建议拆为：

```text
PreConsultSession
  ├─ status: CREATED / COLLECTING / RUNNING / PARTIAL_READY / COMPLETED / FAILED / NEED_HUMAN_REVIEW
  ├─ currentStep
  ├─ retryCount
  ├─ riskFlag
  └─ lastErrorCode
```

居民端可以先看到“已生成初步建议”，医生端/卫健端可以看到完整链路是否已完成。对 P0/P1 高风险、模型输出低置信度、数据冲突、规则命中不一致等情况，状态应进入 `NEED_HUMAN_REVIEW`，而不是直接自动给出完整结论。

### 3. 医疗安全边界：规则优先，大模型只做辅助生成

生产环境中，建议把 Agent 分为三类：

| 类型                 |  是否允许 LLM 主导 | 说明                                 |
| ------------------ | -----------: | ---------------------------------- |
| 问诊结构化采集            |         可以辅助 | 把自然语言转为症状、持续时间、伴随症状、既往史等结构化字段      |
| 健康档案摘要 / 报告摘要      |         可以辅助 | 但必须引用真实数据来源，标注数据时间和来源              |
| 分诊等级 / 急症识别 / 禁忌风险 | 不建议 LLM 单独决策 | 应以规则引擎、医学知识库、红旗症状规则为主，LLM 只解释和补全文案 |
| 推荐机构 / 科室 / 医生     | 不建议 LLM 单独决策 | 应由资源匹配规则、距离、能力、服务承接、号源等决定          |
| 居民端最终文案            |    不直接展示模型原文 | 必须经过展示映射、安全词库和合规模板                 |

文档中已经区分了居民端与专业端展示边界：居民端只表达“就医建议”和“导诊指引”，不展示 P0-P4、推荐分、Agent 原始输出；专业端才展示 P0-P4、推荐分、AgentRun、风险关注点等。这个边界生产环境必须继续保留，并进一步固化到后端 DTO，而不是只靠前端组件隐藏。

---

## 三、真实数据接入优化：建立“医疗数据反腐层”，不要让外部系统污染核心模型

当前数据模型已经覆盖居民健康档案、医疗资源、预问诊、规则知识库、Agent 质量、行为意图和服务线索等域。文档也说明当前 SQLite、String JSON、Mock 角色入口只是演示用途。 生产化接 HIS、EMR、LIS、PACS、省平台时，最大风险不是“接口调不通”，而是**外部系统字段不一致、患者身份不一致、时间口径不一致、数据质量不一致**。

### 1. 新增 Integration Gateway，而不是在业务模块里直接调 HIS/EMR

建议新增：

```text
src/integration/
├─ connectors/
│  ├─ his-connector.ts
│  ├─ emr-connector.ts
│  ├─ lis-connector.ts
│  ├─ pacs-connector.ts
│  ├─ appointment-connector.ts
│  ├─ health-card-connector.ts
│  └─ public-health-connector.ts
├─ mappers/
│  ├─ medical-record-mapper.ts
│  ├─ lab-result-mapper.ts
│  ├─ diagnosis-mapper.ts
│  └─ medication-mapper.ts
├─ normalizers/
│  ├─ patient-identity-normalizer.ts
│  ├─ institution-code-normalizer.ts
│  ├─ department-code-normalizer.ts
│  └─ terminology-normalizer.ts
└─ sync/
   ├─ batch-sync-jobs.ts
   ├─ incremental-sync-jobs.ts
   └─ dead-letter-handler.ts
```

业务服务只消费平台内部统一模型，不直接认识各医院的字段名、接口风格、状态码和异常码。

### 2. 数据分三层：原始层、规范层、应用层

建议把现在的业务表继续保留为“应用层”，但在前面加两层：

| 层级            | 数据                                                                       | 作用          |
| ------------- | ------------------------------------------------------------------------ | ----------- |
| Raw 原始层       | 外部接口原文、原始 JSON、文件地址                                                      | 可追溯、可重放、可排错 |
| Canonical 规范层 | 标准化后的诊断、用药、检验、检查、机构、医生、号源                                                | 跨机构统一语义     |
| App 应用层       | HealthSummary、DoctorHealthProfile、RiskFocusItem、Recommendation、GuidePlan | 面向三端页面和业务流程 |

这样做的好处是：外部系统接口改字段时，不会直接影响居民端、医生端、卫健端；模型输出有争议时，可以回查原始来源；医生端可以看到“数据来自哪里、何时产生、是否可信”。

### 3. 每条真实医疗数据必须带来源、时间、可信度和授权

建议给 `MedicalRecord`、`Diagnosis`、`Medication`、`LabResult`、`Allergy` 等核心表补充或规范以下字段：

```text
sourceSystem        // HIS / EMR / LIS / PACS / 公卫 / 手工录入
sourceOrgCode       // 来源机构
sourceRecordId      // 外部系统原始 ID
eventTime           // 医疗事件发生时间
ingestedAt          // 平台接入时间
updatedAtFromSource // 外部系统更新时间
dataStatus          // active / corrected / revoked / duplicated
confidenceLevel     // high / medium / low
consentScopeId      // 本次数据使用授权范围
normalizedVersion   // 规范化规则版本
```

对大模型而言，`eventTime` 和 `sourceSystem` 尤其重要。否则模型很容易把 3 年前的检查结果当作当前状态，把居民自述当作确诊结论。

---

## 四、数据库与数据模型优化：从 SQLite/String JSON 迁移到生产 OLTP + JSONB/结构化表

文档已经把当前主要维护风险列得很清楚：SQLite + Mock 数据不适合多人真实并发，String JSON 会让复杂查询吃力，部分 API 缺少统一 zod 校验，权限边界、合规、人审、审计、兜底流程尚未实现。

建议优先做这几件事：

| 当前状态                    | 生产化优化                                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| SQLite                  | 迁移 PostgreSQL 或 MySQL，优先 PostgreSQL，便于 JSONB、全文检索、向量扩展生态                   |
| String JSON             | 可查询字段结构化；非关键扩展字段改 JSONB；所有 JSON 必须 schema 化                                |
| 页面/API 里直接拼复杂 include   | 收敛到 `src/server/queries/*` 和 `src/server/mutations/*`                      |
| Seed 演示病例               | 保留 demo seed，但新增 sandbox、staging、production 三套环境数据策略                       |
| AgentRun 只做演示日志         | 扩展为可审计、可回放、可质量评估的数据资产                                                      |
| Recommendation 可能承载过多含义 | 按文档建议新增 `AppointmentIntent` / `AppointmentRecord`，不要把挂号状态塞进 Recommendation |

尤其是挂号/号源接入，不建议直接改 `Recommendation`。`Recommendation` 应只表达“推荐意图与理由”，真实挂号应新增：

```text
AppointmentIntent
- residentId
- recommendationId
- guidePlanId
- institutionId
- departmentId
- doctorId?
- preferredTimeRange
- status: CREATED / SUBMITTED / LOCKED / CONFIRMED / CANCELLED / EXPIRED / FAILED
- source: AI_GUIDE / USER_SELECTED / DOCTOR_ASSIGNED

AppointmentRecord
- appointmentIntentId
- externalAppointmentId
- externalSystem
- visitDateTime
- feeStatus
- registrationStatus
- cancelReason
```

这样未来接真实挂号、医保、支付时不会污染导诊推荐模型。

---

## 五、权限与身份体系优化：三端不能再共用“无边界数据视图”

当前文档明确说居民端、医生端、卫健端共用同一数据库对象，接认证后要补权限边界。 生产化时建议把权限做成后端强约束，而不是仅靠前端路由分隔。

### 1. 身份来源建议

| 用户      | 身份来源                            |
| ------- | ------------------------------- |
| 居民      | 微信小程序登录 + 电子健康卡/实名信息绑定 + 家庭成员授权 |
| 医生/导诊人员 | 医院统一身份认证、账号体系或卫健侧统一 SSO         |
| 社区医生    | 社区卫生服务中心组织关系 + 服务辖区权限           |
| 卫健管理员   | 卫健委组织账号 + 分级管理权限                |
| 系统/接口账号 | 独立 client credential，不与自然人账号混用  |

### 2. 权限模型建议：RBAC + ABAC

只做 RBAC 不够。医生能不能看某个居民，不仅取决于角色，还取决于是否存在接诊关系、推荐关系、服务线索、居民授权、机构归属和时间窗口。

建议判断模型：

```text
canAccessPatient(user, resident, purpose)
  = roleAllowed
  + institutionAllowed
  + careRelationshipExists
  + consentScopeAllowed
  + dataSensitivityAllowed
  + auditRequired
```

典型规则：

| 场景                | 权限                |
| ----------------- | ----------------- |
| 居民看自己健康档案         | 可看居民端友好视图         |
| 家庭成员看老人/儿童档案      | 需要家庭成员授权与监护关系     |
| 医生看被推荐患者          | 只在接诊/导诊/随访时间窗口内可看 |
| 社区医生看慢病随访对象       | 只能看辖区和服务关系内数据     |
| 卫健管理员看运营指标        | 默认看聚合脱敏数据，不看个人明细  |
| 卫健质控看 AgentRun 明细 | 需要高权限、审计、脱敏策略     |

---

## 六、合规与安全架构：把“可用”改造成“可上线、可审计、可追责”

医疗健康信息属于敏感个人信息。《个人信息保护法》将“医疗健康”等列为敏感个人信息，并要求处理敏感个人信息具有特定目的、充分必要性、严格保护措施，处理敏感个人信息还应取得个人的单独同意。([中国网络信息中心][1]) 因此，架构上必须补齐同意管理、最小必要、访问审计、数据脱敏、授权撤回等能力。

生成式 AI 方面，《生成式人工智能服务管理暂行办法》要求提供和使用生成式 AI 服务遵守法律法规，防止健康等歧视，尊重个人信息权益，并提升生成内容准确性和可靠性；涉及个人信息的，也要依法承担个人信息保护义务。([中国网络信息中心][2]) 对本项目而言，这意味着大模型调用前需要做敏感信息最小化、调用记录留痕、模型输出安全校验和投诉/反馈处理。

如果未来进入互联网诊疗、处方、复诊服务等范围，还必须明确 AI 不能自动开处方。《互联网诊疗监管细则（试行）》要求处方由接诊医师本人开具，严禁使用人工智能等自动生成处方；同时要求互联网诊疗活动全程留痕、可追溯，并规定相关平台实施第三级及以上信息安全等级保护。([国家卫生健康委员会][3]) 所以当前系统应继续定位为“智能预问诊、导诊建议、健康管理辅助”，不要跨到“自动诊断、自动治疗、自动处方”。

建议新增几个基础能力：

```text
ConsentService
- 居民授权范围
- 家庭成员授权
- 医生查看授权
- AI 使用授权
- 授权撤回

AuditService
- 谁在什么时间
- 因为什么业务目的
- 查看了哪类数据
- 是否导出/调用模型/生成摘要

PrivacyService
- 脱敏
- 去标识化
- 最小上下文组装
- 日志敏感字段遮罩

HumanReviewService
- 高风险预问诊复核
- 低置信度结果复核
- 医生反馈闭环
- 质量问题处置
```

---

## 七、API 与前后端契约优化：所有写接口必须“可校验、可幂等、可回滚”

文档中已经要求新增写接口补 zod 输入校验、API 返回结构向后兼容、复杂查询集中到 server query。 生产化时建议进一步升级为统一 API 契约。

### 1. API 统一规范

每个写接口建议都有：

```text
requestId          // 前端生成，用于幂等
operatorId         // 当前操作者
operatorRole
purpose            // PRE_CONSULT / GUIDE / FOLLOW_UP / QUALITY_REVIEW
consentScopeId
payload
```

返回结构：

```ts
{
  data?: T;
  error?: {
    code: string;
    message: string;
    traceId: string;
    retryable: boolean;
  };
  meta: {
    requestId: string;
    traceId: string;
    version: string;
  }
}
```

### 2. 接口分层建议

```text
/app/api              // 继续作为 Next.js Route Handler / BFF
/src/server/queries   // 页面级读取聚合
/src/server/mutations // 写入用例
/src/domain           // 领域模型与领域服务
/src/integration      // 外部系统适配
/src/ai               // AI 网关与 Agent 编排
/src/security         // 权限、审计、隐私
```

这样下一步即使拆服务，也可以按目录边界平滑拆，而不是从页面代码里硬拆。

---

## 八、模块级优化建议

### 1. 智能预问诊模块

建议把当前预问诊从“演示链路”改造成“医疗安全状态机”。

关键改造：

| 优化项           | 说明                               |
| ------------- | -------------------------------- |
| 红旗症状规则前置      | 胸痛、意识障碍、呼吸困难、大出血等不等模型，直接建议急诊/120 |
| LLM 只做结构化采集   | 不让模型直接给分诊等级                      |
| 输出 schema 强约束 | 症状、持续时间、伴随症状、危险因素、既往史必须结构化       |
| 风险分级双轨        | 规则引擎输出等级，LLM 生成解释，二者冲突时进入人工复核    |
| 会话可恢复         | 居民退出后可继续，医生端可看到采集完整度             |
| 低置信度兜底        | “信息不足，建议补充问题/线下就医”，不要硬给结论        |

### 2. 健康档案模块

医生端的核心价值是把零散患者记录整理成诊前可读视图，而不是重复居民端结果页；文档中也明确医生端要看到跨机构记录来源、风险关注点和数据质量问题。

建议增加：

```text
HealthRecordAssembler
- 从 MedicalRecord / Diagnosis / Medication / LabResult / Allergy 聚合
- 生成居民端摘要 HealthSummary
- 生成医生端 DoctorHealthProfile
- 生成 RiskFocusItem
- 标注数据来源、时间、缺失项、冲突项
```

居民端只看友好摘要，医生端看专业摘要和证据链，卫健端看聚合指标和数据质量。

### 3. 医疗资源与推荐模块

当前资源匹配依赖机构类型、科室关键词、疾病关键词、医生能力和服务能力。 生产化后建议引入实时资源维度：

| 当前维度  | 生产新增维度                     |
| ----- | -------------------------- |
| 机构类型  | 是否在线、服务状态、是否支持转诊           |
| 科室关键词 | 科室真实编码、专病门诊、互联网门诊能力        |
| 医生擅长  | 出诊时间、号源状态、接诊限制             |
| 社区能力  | 家医签约、慢病随访、上门服务、辖区限制        |
| 推荐分   | 可解释分：医学匹配、距离、可及性、连续管理、服务承接 |

推荐结果必须可解释、可审计，不能让 LLM “凭感觉推荐医生”。

### 4. 报告解读模块

报告解读是高风险模块。建议生产化时先支持结构化检验报告，不急于做影像识别。

推荐路径：

```text
第一阶段：LIS 检验结构化数据解读
第二阶段：PDF/图片报告 OCR + 人工校验
第三阶段：PACS 影像报告文本解读
第四阶段：影像图像 AI，仅作为独立合规项目评估
```

居民端文案要强调“指标解释、复诊建议、就医提醒”，不要输出诊断结论。医生端可以展示异常项、趋势和来源。

### 5. 行为意图与服务线索模块

文档中说明当前意图识别是规则 + Mock LLM 摘要，不是真实用户画像系统，文案应保持“初步建议”和“服务承接”口径。 生产化时建议把它从“用户画像”改名为“服务承接线索”，避免隐私和营销化风险。

建议增加：

| 优化项       | 说明                     |
| --------- | ---------------------- |
| 明确采集清单    | 哪些行为采集、为什么采集、保留多久      |
| 居民授权与关闭入口 | 用户可关闭非必要行为分析           |
| 线索分级      | 医疗风险线索、健康管理线索、运营提醒线索分开 |
| 线索有效期     | 超期自动失效，避免长期跟踪          |
| 卫健端默认聚合   | 不展示个人明细，除非进入质控/服务处理流程  |

---

## 九、可观测性与质量治理：生产环境必须知道“模型有没有变坏、数据有没有变脏”

建议建设三个看板，而不是只看业务访问量：

### 1. AI 运行质量看板

```text
- 每个 Agent 调用量
- 模型版本分布
- 平均延迟 / P95 延迟
- 失败率 / 超时率 / 重试率
- 结构化输出校验失败率
- 高风险命中数
- 人工复核率
- 医生反馈准确率
- 每日 token 与费用
```

### 2. 数据质量看板

```text
- 各机构数据接入成功率
- HIS/EMR/LIS/PACS 同步延迟
- 患者身份匹配失败数
- 重复记录数
- 缺失字段排行
- 检验异常值解析失败数
- 数据冲突记录数
```

### 3. 安全审计看板

```text
- 高敏数据访问次数
- 越权访问拦截次数
- 批量查询/导出行为
- 大模型调用涉及敏感字段统计
- 管理员操作日志
- 医生跨机构查看日志
```

这些能力可以直接复用和增强当前的 Agent 日志、质量反馈、意图洞察、服务线索能力，而不是另起一套后台。文档中卫健端已经有 Agent 日志、质量反馈、意图洞察、运行驾驶舱等页面基础。

---

## 十、建议的下次迭代优先级

我建议按四个阶段推进。

### P0：生产化地基，先做，不做会返工

| 任务                               | 产出                          |
| -------------------------------- | --------------------------- |
| 数据库从 SQLite 迁移到 PostgreSQL/MySQL | 生产数据底座                      |
| 统一 zod 校验和 API 错误码               | 所有写接口可控                     |
| 建立 Auth/RBAC/ABAC 基础             | 三端权限边界                      |
| 建立 AuditLog                      | 医疗数据访问可追溯                   |
| 建立 AiGateway                     | Mock 与真实模型可切换               |
| 建立 Integration Gateway 骨架        | 后续 HIS/EMR/LIS/PACS 接入不污染业务 |
| Agent 输出 schema 化                | 模型结果可验证、可回放                 |
| 居民端 DTO 与专业端 DTO 分离              | 防止内部字段泄漏                    |

### P1：先接低风险真实数据

优先接：

1. 机构、科室、医生、服务能力。
2. 社区卫生服务中心服务能力。
3. 电子健康卡/居民身份绑定。
4. 挂号资源或预约意向。
5. 结构化健康档案摘要。

暂缓接：

1. 影像识别。
2. 自动诊断。
3. 自动处方。
4. 医保支付。
5. 跨机构深度病历全量同步。

### P2：接真实大模型，但保持安全降级

先让真实大模型承担：

| Agent    | 建议接入优先级   |
| -------- | --------- |
| 预问诊结构化采集 | 高         |
| 健康摘要润色   | 高         |
| 报告解释文案   | 中         |
| 导诊说明文案   | 中         |
| 质量问题摘要   | 中         |
| 分诊等级决策   | 低，不建议模型主导 |
| 医生推荐决策   | 低，不建议模型主导 |

### P3：真实医疗闭环与治理

到这一阶段再做：

```text
- 预约挂号状态回写
- 医生反馈闭环训练集
- 质控抽样
- RAG 知识库版本管理
- 省/区监管指标上报
- 慢病随访任务闭环
- 服务线索绩效与满意度闭环
```

---

## 十一、迭代前定下来的 8 个架构决策

1. **大模型是否允许接收可识别个人信息**：建议默认不允许，除非私有化模型或完成明确授权与安全评估。
2. **分诊等级由谁最终决定**：建议规则引擎主导，LLM 只辅助解释。
3. **居民端是否展示模型原文**：建议永不直接展示，必须经过安全模板和展示映射。
4. **真实数据以谁为主索引**：建议先确定居民主索引/MPI，否则多机构数据无法稳定合并。
5. **挂号是否并入 Recommendation**：不建议，应新增 AppointmentIntent/AppointmentRecord。
6. **是否保留模块化单体**：建议第一阶段保留，不急拆微服务。
7. **卫健端能否看个人明细**：默认聚合脱敏，明细访问必须有业务目的和审计。
8. **AgentRun 保存什么内容**：建议保存可回放信息，但敏感字段脱敏或加密，避免日志成为隐私风险源。

---

## 最关键的一句话

这套系统的生产化障碍不是“缺一个大模型 API Key”或“缺几条真实数据接口”，而是要把当前 demo 中隐含的边界显式产品化：**模型边界、数据边界、权限边界、医疗责任边界、审计边界**。下一轮迭代优先把这些边界做成代码和数据模型，再接真实模型和真实数据，后续扩展会稳很多。