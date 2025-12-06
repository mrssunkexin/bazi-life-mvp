# 部署指南

本文档说明如何将八字命理分析系统部署到云端。

## 数据库配置

项目已配置支持 **MySQL** 数据库（也可以使用 PostgreSQL）。

### 环境变量配置

在部署平台设置以下环境变量：

```env
# 数据库连接（MySQL 格式）
DATABASE_URL=mysql://username:password@host:3306/database_name

# AI API 配置
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek API密钥
AI_MODEL=deepseek-chat
AI_BASE_URL=https://api.deepseek.com/v1

# 管理员密码
NEXT_PUBLIC_ADMIN_PASSWORD=你的管理员密码
```

### MySQL 连接字符串格式

```
mysql://用户名:密码@主机地址:端口/数据库名
```

示例：
```
mysql://root:mypassword@localhost:3306/bazi_life
mysql://admin:pass123@db.example.com:3306/production_db
```

## 部署步骤

### 方案 1：Zeabur 部署（推荐）

1. **注册 Zeabur**：访问 https://zeabur.com
2. **连接 GitHub**：授权 Zeabur 访问您的 GitHub 仓库
3. **创建项目**：
   - 点击 "New Project"
   - 选择您的 `bazi-life-mvp` 仓库
4. **添加 MySQL 数据库**：
   - 在项目中点击 "Add Service"
   - 选择 "MySQL"
   - Zeabur 会自动配置 `DATABASE_URL`
5. **配置环境变量**：
   - 在项目设置中添加上述环境变量
   - `DATABASE_URL` 会自动生成
6. **部署**：
   - Zeabur 会自动构建和部署
   - 首次部署需要运行数据库初始化

### 方案 2：Vercel + PlanetScale

1. **部署到 Vercel**：
   ```bash
   npm i -g vercel
   vercel
   ```

2. **创建 PlanetScale 数据库**：
   - 访问 https://planetscale.com
   - 创建免费数据库
   - 获取连接字符串

3. **配置环境变量**：
   在 Vercel 项目设置中添加环境变量

### 方案 3：Railway

1. **访问 Railway**：https://railway.app
2. **连接 GitHub**：导入您的仓库
3. **添加 MySQL**：Railway Marketplace 中添加 MySQL
4. **配置环境变量**：自动注入 `DATABASE_URL`

## 数据库初始化

部署后，需要初始化数据库结构：

### 方法 1：使用内置脚本

在部署平台的终端运行：
```bash
npm run db:migrate
```

### 方法 2：手动执行

```bash
npx prisma db push
```

## 验证部署

1. 访问部署后的网址
2. 测试主页是否正常加载
3. 访问 `/admin` 测试管理后台
4. 提交一个测试报告，确认数据库写入正常

## 常见问题

### Q: 数据库连接失败
**A**: 检查 `DATABASE_URL` 格式是否正确，确保数据库服务器可访问

### Q: Prisma Client 报错
**A**: 运行 `npm run prisma:generate` 重新生成客户端

### Q: 部署后页面空白
**A**: 检查环境变量是否正确配置，查看部署日志

## 性能优化

1. **启用数据库连接池**：
   ```env
   DATABASE_URL=mysql://user:pass@host:3306/db?connection_limit=5
   ```

2. **配置 Prisma 连接池**（在 `prisma/schema.prisma`）：
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

## 成本估算

- **Zeabur**: 免费额度足够小型项目
- **MySQL**:
  - Zeabur: 免费 (共享)
  - PlanetScale: 免费 5GB
  - Railway: 免费 $5/月额度
- **DeepSeek API**: ¥0.036/报告

## 监控和日志

部署后建议：
1. 配置错误监控（如 Sentry）
2. 定期备份数据库
3. 监控 API 使用量和成本

---

更新时间：2025-12-06
