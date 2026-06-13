# ECS 公网演示部署说明

本文档面向阿里云 ECS 或火山云 ECS 的公网演示部署。当前系统是 Mock 数据演示版，推荐使用一台 Linux ECS + Docker Compose + Nginx 反向代理。

## 1. 部署定位

- 目标：公网可访问的演示 Demo，不承载真实医疗数据。
- 推荐入口：`/gaoxin`、`/doctor`、`/admin`。
- 数据库：SQLite，本地文件持久化到 ECS 磁盘或 Docker volume。
- AI：`MockAiProvider`，不接真实大模型。
- 认证：Mock 角色入口，不做真实身份认证。

生产化前应迁移到 PostgreSQL/Turso/Supabase 或云数据库，并补齐真实认证、权限、审计和安全网关。

## 2. ECS 建议配置

演示环境建议：

- 操作系统：Ubuntu 22.04 / 24.04 LTS 或 Alibaba Cloud Linux 3。
- 规格：2 vCPU / 4 GB 内存起步。
- 磁盘：40 GB 起步，SQLite 数据文件建议放在独立目录或 Docker volume。
- 安全组：
  - 开放 80、443。
  - 3000 仅本机监听，不建议公网开放。
  - 22 仅允许运维 IP 访问。

## 3. 推荐方案：Docker Compose

### 3.1 安装基础软件

```bash
sudo apt update
sudo apt install -y git curl nginx

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

国内 ECS 如果拉取 Docker Hub 较慢，建议配置阿里云或火山云镜像加速。

### 3.2 拉取代码

```bash
sudo mkdir -p /opt/gaoxin-health
sudo chown -R $USER:$USER /opt/gaoxin-health
cd /opt/gaoxin-health

git clone git@github.com:Elioxxxx/gaoxin-health.git .
```

如果 ECS 没有配置 GitHub SSH Key，可临时使用 HTTPS 地址拉取。

### 3.3 配置环境变量

```bash
cp .env.production.example .env.production
```

默认 Docker Compose 使用：

```bash
DATABASE_URL="file:/app/data/gaoxin-health.db"
SQLITE_DB_PATH="/app/data/gaoxin-health.db"
SEED_ON_START="false"
```

首次启动时如果数据库文件不存在，容器会自动执行 migration 和 seed。后续重启不会自动清空数据。需要重置演示数据时，把 `.env.production` 中 `SEED_ON_START` 临时改为 `true`，启动成功后再改回 `false`。

### 3.4 启动服务

```bash
docker compose -f docker-compose.ecs.yml up -d --build
docker compose -f docker-compose.ecs.yml ps
docker compose -f docker-compose.ecs.yml logs -f gaoxin-health
```

容器内应用监听 3000，Compose 默认只绑定到 `127.0.0.1:3000`，由 Nginx 对外代理。

### 3.5 健康检查

```bash
curl http://127.0.0.1:3000/api/health
```

预期返回：

```json
{
  "status": "ok",
  "service": "gaoxin-health"
}
```

## 4. Nginx 反向代理

复制示例配置：

```bash
sudo cp deploy/nginx/gaoxin-health.conf.example /etc/nginx/conf.d/gaoxin-health.conf
sudo sed -i 's/your-domain.example.com/你的域名或公网IP/g' /etc/nginx/conf.d/gaoxin-health.conf
sudo nginx -t
sudo systemctl reload nginx
```

访问：

```text
http://你的域名或公网IP/gaoxin
```

如果已有域名，建议使用 Certbot 或云厂商证书服务配置 HTTPS。

## 5. 备用方案：Node + systemd

不使用 Docker 时，可直接在 ECS 上运行 Node.js 和 pnpm。

```bash
sudo npm install -g pnpm@10.33.2
pnpm install --frozen-lockfile
cp .env.production.example .env.production
```

如果不是 Docker，建议将 `.env.production` 改为服务器真实路径：

```bash
DATABASE_URL="file:/opt/gaoxin-health/data/gaoxin-health.db"
SQLITE_DB_PATH="/opt/gaoxin-health/data/gaoxin-health.db"
```

初始化：

```bash
mkdir -p data
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm build
```

启动：

```bash
pnpm start:ecs
```

也可以参考 [deploy/systemd/gaoxin-health.service.example](../deploy/systemd/gaoxin-health.service.example) 创建 systemd 服务。systemd 启动示例不会自动 seed，避免重启时清空演示操作。

## 6. 更新发布

Docker Compose 推荐流程：

```bash
cd /opt/gaoxin-health
git pull
docker compose -f docker-compose.ecs.yml up -d --build
curl http://127.0.0.1:3000/api/health
```

如果需要重置演示数据：

```bash
docker compose -f docker-compose.ecs.yml exec gaoxin-health pnpm db:seed
```

## 7. 备份与恢复

SQLite 文件在 Docker volume `gaoxin_sqlite_data` 中。演示期可以用以下方式导出备份：

```bash
docker compose -f docker-compose.ecs.yml exec gaoxin-health sh -lc 'cp /app/data/gaoxin-health.db /tmp/gaoxin-health.db'
docker cp gaoxin-health:/tmp/gaoxin-health.db ./gaoxin-health-$(date +%F).db
```

恢复前请先停服务，再覆盖数据库文件。不要在服务写入时直接覆盖 SQLite 文件。

## 8. 验收路径

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

健康检查：

- `/api/health`

## 9. 上线注意事项

- 当前是 Mock 演示系统，不接真实居民身份和真实医疗数据。
- ECS 公网开放前，请确认 `.env`、数据库文件、SSH Key 未提交到 Git。
- 不建议直接公网开放 3000，应由 Nginx 代理 80/443。
- 如用于长时间演示，建议定期备份 SQLite 文件。
- 真实生产环境需要迁移到云数据库、对象存储、真实认证、权限审计、日志脱敏、WAF 和 HTTPS。
