# ECS 公网演示部署说明

本文档面向阿里云 ECS 或火山云 ECS 的公网演示部署。当前项目默认采用“GitHub 代码源 + ECS 拉取发布 + Node.js + systemd + Nginx”的方式，已用于当前公网 Demo。

## 1. 部署定位

- 目标：公网可访问的演示 Demo，不承载真实医疗数据。
- 推荐入口：`/gaoxin`、`/doctor`、`/admin`。
- 数据库：SQLite，持久化到 ECS 磁盘。
- AI：`MockAiProvider`，不接真实大模型。
- 认证：Mock 角色入口，不做真实身份认证。
- 代码源：GitHub `main` 分支。

生产化前应迁移到云数据库，并补齐真实认证、权限、审计、日志脱敏、HTTPS、WAF 和安全网关。

## 2. 当前线上约定

当前演示环境使用以下约定：

- 代码目录：`/opt/gaoxin-health/current`
- 数据目录：`/opt/gaoxin-health/data`
- SQLite 文件：`/opt/gaoxin-health/data/gaoxin-health.db`
- systemd 服务：`gaoxin-health.service`
- 应用监听：`127.0.0.1:3000`
- Nginx：公网 80 反向代理到本机 3000

示例环境变量文件位于仓库根目录：

```bash
.env.production.example
```

服务器上应复制为：

```bash
/opt/gaoxin-health/current/.env.production
```

## 3. ECS 建议配置

演示环境建议：

- 操作系统：Ubuntu 22.04 / 24.04 LTS 或 Alibaba Cloud Linux 3。
- 规格：2 vCPU / 4 GB 内存起步。
- 磁盘：40 GB 起步，SQLite 数据文件放在 `/opt/gaoxin-health/data`。
- 安全组：
  - 开放 80、443。
  - 3000 仅本机监听，不建议公网开放。
  - 22 仅允许运维 IP 访问。

## 4. 首次部署

### 4.1 安装基础软件

```bash
sudo apt update
sudo apt install -y git curl nginx nodejs npm
sudo npm install -g pnpm@10.33.2
```

如果系统 Node.js 版本低于 `package.json` 的 `engines.node` 要求，请通过 nvm、NodeSource 或云厂商软件源安装 Node.js 22+。

### 4.2 创建目录和运行用户

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin gaoxin || true
sudo mkdir -p /opt/gaoxin-health/current /opt/gaoxin-health/data
sudo chown -R gaoxin:gaoxin /opt/gaoxin-health
```

### 4.3 拉取代码

```bash
sudo -u gaoxin git clone git@github.com:Elioxxxx/gaoxin-health.git /opt/gaoxin-health/current
```

如果 ECS 没有配置 GitHub SSH Key，可使用 HTTPS 地址拉取只读代码。不要把 GitHub Token 写入仓库文件。

### 4.4 配置环境变量

```bash
cd /opt/gaoxin-health/current
sudo -u gaoxin cp .env.production.example .env.production
```

`.env.production` 推荐保持：

```bash
DATABASE_URL="file:/opt/gaoxin-health/data/gaoxin-health.db"
SQLITE_DB_PATH="/opt/gaoxin-health/data/gaoxin-health.db"
NODE_ENV="production"
APP_ENV="demo"
APP_VERSION="ecs-demo"
PORT="3000"
NEXT_TELEMETRY_DISABLED="1"
SEED_ON_START="false"
```

### 4.5 初始化数据库和构建

```bash
cd /opt/gaoxin-health/current
sudo -u gaoxin pnpm install --frozen-lockfile
sudo -u gaoxin pnpm db:generate
sudo -u gaoxin pnpm db:deploy
sudo -u gaoxin pnpm db:seed
sudo -u gaoxin pnpm build
```

## 5. systemd 服务

复制示例服务：

```bash
sudo cp /opt/gaoxin-health/current/deploy/systemd/gaoxin-health.service.example /etc/systemd/system/gaoxin-health.service
sudo systemctl daemon-reload
sudo systemctl enable gaoxin-health
sudo systemctl start gaoxin-health
sudo systemctl status gaoxin-health --no-pager
```

服务启动时会执行 `pnpm db:generate` 和 `pnpm db:deploy`，不会自动 seed，避免重启时清空演示操作。

查看日志：

```bash
sudo journalctl -u gaoxin-health -f
```

## 6. Nginx 反向代理

复制示例配置：

```bash
sudo cp /opt/gaoxin-health/current/deploy/nginx/gaoxin-health.conf.example /etc/nginx/conf.d/gaoxin-health.conf
sudo sed -i 's/your-domain.example.com/你的域名或公网IP/g' /etc/nginx/conf.d/gaoxin-health.conf
sudo nginx -t
sudo systemctl reload nginx
```

访问：

```text
http://你的域名或公网IP/gaoxin
```

如果已有域名，建议使用 Certbot 或云厂商证书服务配置 HTTPS。

## 7. 常规更新发布

以后默认发布流程：

1. 本地完成修改。
2. 本地执行 `pnpm lint`、`pnpm typecheck`、`pnpm build`。
3. 提交前检查秘密信息，确认 `.env`、数据库、SSH Key、云厂商密钥和 Token 没有进入 Git。
4. 推送到 GitHub `main`。
5. ECS 拉取 `main` 并重启服务。

ECS 执行：

```bash
cd /opt/gaoxin-health/current
sudo -u gaoxin git fetch origin main
sudo -u gaoxin git reset --hard origin/main
sudo -u gaoxin pnpm install --frozen-lockfile
sudo -u gaoxin pnpm db:generate
sudo -u gaoxin pnpm db:deploy
sudo -u gaoxin pnpm build
sudo systemctl restart gaoxin-health
curl -fsS http://127.0.0.1:3000/api/health
```

如需重置演示数据，再手动执行：

```bash
cd /opt/gaoxin-health/current
sudo -u gaoxin pnpm db:seed
sudo systemctl restart gaoxin-health
```

## 8. 发布前秘密信息检查

每次推 GitHub 前至少检查：

```bash
git status --short
git diff --cached --check
git diff --cached -- . ':(exclude)pnpm-lock.yaml' | rg -n "(AKIA|ASIA|sk-[A-Za-z0-9]|AIza|xox[baprs]-|ghp_|github_pat_|-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----|password\\s*=|secret\\s*=|access[_-]?key|LTAI)" || true
git ls-files | rg '(^|/)\\.env$|\\.env\\.production|dev\\.db|id_ed25519|\\.pem$' || true
```

`.gitignore` 已覆盖 `.env`、`.env.*`、`*.db`、`.next`、`node_modules` 等本地文件。若发现任何真实密钥，先移除并轮换密钥，再提交。

## 9. 健康检查与验收路径

健康检查：

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

居民端：

- `/gaoxin`
- `/gaoxin/ai`
- `/gaoxin/health-record`
- `/gaoxin/pre-consult?demo=chest-pain`

医生端：

- `/doctor`
- `/doctor/service-leads`

卫健端：

- `/admin`
- `/admin/intent-insights`

## 10. 备份与恢复

SQLite 文件位于：

```text
/opt/gaoxin-health/data/gaoxin-health.db
```

演示期可定期备份：

```bash
sudo cp /opt/gaoxin-health/data/gaoxin-health.db /opt/gaoxin-health/data/gaoxin-health-$(date +%F-%H%M).db
```

恢复前请先停服务，再覆盖数据库文件。不要在服务写入时直接覆盖 SQLite 文件。

## 11. 可选 Docker 方案

仓库仍保留 `Dockerfile` 和 `docker-compose.ecs.yml`，用于后续需要容器化时启用。当前默认发布方式不是 Docker，也不依赖任何海外免费平台。国内 ECS 如需启用 Docker，建议先配置阿里云或火山云镜像加速。

## 12. 上线注意事项

- 当前是 Mock 演示系统，不接真实居民身份和真实医疗数据。
- ECS 公网开放前，请确认 `.env`、数据库文件、SSH Key 未提交到 Git。
- 不建议直接公网开放 3000，应由 Nginx 代理 80/443。
- 如用于长时间演示，建议定期备份 SQLite 文件。
- 真实生产环境需要迁移到云数据库、对象存储、真实认证、权限审计、日志脱敏、WAF 和 HTTPS。
