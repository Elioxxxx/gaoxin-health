# PostgreSQL 生产数据库迁移方案

本文档用于把当前 SQLite Demo 数据库平滑迁移到阿里云或火山云生产环境的 PostgreSQL 主库。当前仓库仍保留 SQLite 演示配置，避免影响已上线 Demo；进入真实生产环境前，应按本文档单独执行数据库迁移分支。

## 1. 当前状态

- Demo 数据库：SQLite，ECS 上持久化到 `/opt/gaoxin-health/data/gaoxin-health.db`。
- ORM：Prisma。
- 迁移命令：`pnpm db:deploy` 对应 `prisma migrate deploy`。
- JSON 字段：当前大量字段以 `String` 保存 JSON 文本，并通过 `src/lib/json.ts`、`src/lib/json-utils.ts` 解析。
- 数据类型：包含居民、健康档案、医生版健康档案、预问诊、推荐导诊、Agent 日志、用户行为、意图洞察和服务线索。

SQLite 适合演示和单机测试，不适合生产多人并发、跨系统同步、审计留痕和复杂运营分析。

## 2. 目标生产形态

推荐优先 PostgreSQL：

- 阿里云：RDS PostgreSQL，生产建议主备高可用版。
- 火山云：云数据库 PostgreSQL，生产建议高可用实例。
- 网络：数据库只开放内网访问，ECS 与数据库位于同一 VPC。
- 连接：应用通过 `DATABASE_URL` 环境变量连接数据库，不把账号密码写入仓库。
- 备份：启用自动备份和至少 7 天保留，重大版本上线前手动快照。

## 3. 迁移原则

1. 生产迁移只使用迁移文件，不手工改库。
2. 已部署迁移不得修改，新增变更必须新建迁移。
3. Schema 变更和数据回填分开。
4. 切换数据库 Provider 应在独立分支完成，并在沙箱库验证。
5. Demo seed、沙箱 seed、生产初始化数据分离，不允许生产执行清空式 seed。
6. 真实居民数据上线前必须先完成认证、授权、同意、审计和脱敏策略。

## 4. 实施阶段

### 阶段 A：准备生产数据库

1. 创建云数据库 PostgreSQL 实例。
2. 创建专用数据库和账号，例如：

```sql
CREATE DATABASE gaoxin_health;
CREATE USER gaoxin_app WITH PASSWORD '通过云平台密钥管理配置';
GRANT ALL PRIVILEGES ON DATABASE gaoxin_health TO gaoxin_app;
```

3. 在 ECS 安全组和 RDS 白名单中只允许内网访问。
4. 在 ECS `.env.production` 中配置：

```bash
DATABASE_URL="postgresql://gaoxin_app:${DB_PASSWORD}@内网地址:5432/gaoxin_health?schema=public"
DATABASE_PROVIDER="postgresql"
SEED_MODE="none"
```

### 阶段 B：建立 PostgreSQL Prisma 分支

Prisma 的 `datasource provider` 是 schema 级配置，不建议在同一份迁移目录里同时维护 SQLite 与 PostgreSQL。建议：

1. 新建生产数据库迁移分支。
2. 将 `prisma/schema.prisma` datasource provider 从 `sqlite` 改为 `postgresql`。
3. 将后续需要查询的 JSON 文本字段逐步迁移为 PostgreSQL `Json` 或结构化明细表。
4. 生成新的 PostgreSQL 初始迁移：

```bash
pnpm db:generate
pnpm prisma migrate dev --name init_postgresql
```

如项目不暴露 `pnpm prisma` 命令，可直接执行：

```bash
pnpm exec prisma migrate dev --name init_postgresql
```

### 阶段 C：区分数据初始化脚本

建议拆分 seed：

- `seed:demo`：当前演示数据，可清空重建。
- `seed:sandbox`：沙箱测试数据，可重复执行但不清库。
- `seed:reference`：生产参考数据，只初始化机构、科室、规则、知识库等基础配置。

生产环境禁止运行会删除居民、预问诊、审计、行为和线索数据的 seed。

### 阶段 D：沙箱验证

在沙箱 PostgreSQL 上执行：

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm patient-demo-check
pnpm intent-demo-check
pnpm operational-demo-check
pnpm lint
pnpm typecheck
pnpm build
```

验证重点：

- 所有 Prisma 查询在 PostgreSQL 下通过。
- JSON 字段解析兼容。
- 预问诊完整链路可跑通。
- 医生端、卫健端写接口会写审计日志。
- `AiInvocation` 能记录 provider、model、promptVersion、token 估算和结构化输出校验。

### 阶段 E：生产切换

1. 备份 SQLite 演示库。
2. 在生产 RDS 上执行 `pnpm db:deploy`。
3. 只执行生产参考数据初始化。
4. 更新 ECS `.env.production` 的 `DATABASE_URL`。
5. 重启服务：

```bash
sudo systemctl restart gaoxin-health
curl -fsS http://127.0.0.1:3000/api/health
```

6. 检查线上路径：

- `/gaoxin`
- `/doctor`
- `/admin`
- `/admin/intent-insights`

## 5. 回滚策略

- 应用回滚：ECS 拉回上一个 Git commit，执行 `pnpm build` 并重启服务。
- 数据库回滚：生产数据库不直接回滚迁移，采用前向修复迁移；重大失败时恢复 RDS 快照到新实例，再切换连接地址。
- 兼容要求：上线前一版应用必须能兼容新增 nullable 字段和新增表。

## 6. 后续改造清单

1. 将频繁分析字段从 `String JSON` 迁移到 `Json` 或结构化表。
2. 为 `UserActionEvent.occurredAt`、`IntentInsight.intentType`、`ServiceLead.receiverType/status/priority` 建立查询索引。
3. 引入数据同步批次表，记录 HIS/EMR/LIS/PACS 原始数据来源和回放状态。
4. 区分居民端安全 DTO、医生端专业 DTO、卫健端运营 DTO。
5. 接入真实身份认证后，将 `AuditLog.actorId` 与真实用户/机构账号绑定。
6. 增加只读报表副本或 OLAP 同步，避免运营看板压生产 OLTP。
