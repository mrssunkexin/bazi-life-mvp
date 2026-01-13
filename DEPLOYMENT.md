# 八字命理小程序 - 完整部署文档

## 项目概述

本项目包含两个部分：
- **后端服务**：Next.js 应用（bazi-life-mvp），提供 API 接口
- **前端小程序**：微信小程序（miniprogram-1），提供用户界面

---

## 一、服务器环境

### 服务器信息
- **服务器地址**：47.99.80.238
- **域名**：https://www.dralexlp.com
- **项目路径**：/var/www/miniapp
- **操作系统**：Linux (Aliyun ECS)
- **分支**：claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R

### 必需软件
- Node.js (已安装)
- npm (已安装)
- Git (已安装)
- Nginx (作为反向代理，已配置)

---

## 二、后端服务部署

### 2.1 代码部署

#### 首次部署
```bash
# 1. SSH 登录服务器
ssh root@47.99.80.238

# 2. 克隆代码（如果还没有）
cd /var/www
git clone <repository-url> miniapp
cd miniapp

# 3. 切换到正确的分支
git checkout claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R

# 4. 安装依赖
npm install

# 5. 构建项目
npm run build

# 6. 启动服务
nohup npm run start > nohup.out 2>&1 &
```

#### 更新部署（迭代更新）- **重要**
```bash
# 1. SSH 登录服务器
ssh root@47.99.80.238

# 2. 进入项目目录
cd /var/www/miniapp

# 3. 拉取最新代码
git pull origin claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R

# 4. 安装新的依赖（如果有 package.json 变化）
npm install

# 5. 重新构建（必须执行）
npm run build

# 6. 查找并停止旧进程
ps aux | grep next-server
# 记下进程 ID (PID)，然后停止
kill -9 <PID>

# 7. 启动新服务
nohup npm run start > nohup.out 2>&1 &

# 8. 验证服务已启动（等待几秒让服务完全启动）
sleep 3
ps aux | grep next-server

# 9. 测试 API（本地）
curl "http://localhost:3000/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"

# 10. 测试 API（公网）
curl "https://www.dralexlp.com/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"
```

### 2.2 常用运维命令

#### 检查服务状态
```bash
# 查看 Next.js 进程
ps aux | grep next-server

# 查看端口占用
netstat -tulpn | grep 3000

# 查看服务日志（实时）
tail -f /var/www/miniapp/nohup.out

# 查看最近 100 行日志
tail -100 /var/www/miniapp/nohup.out

# 搜索错误日志
grep -i error /var/www/miniapp/nohup.out
```

#### 停止服务
```bash
# 找到进程 ID
ps aux | grep next-server

# 停止进程（使用上面找到的 PID）
kill -9 <PID>

# 或者一键停止所有 next-server 进程（谨慎使用）
pkill -9 -f next-server
```

#### 启动服务
```bash
cd /var/www/miniapp
nohup npm run start > nohup.out 2>&1 &
```

#### 检查构建状态
```bash
# 查看 .next 目录（构建产物）
ls -la /var/www/miniapp/.next

# 查看构建时间
ls -lt /var/www/miniapp/.next

# 确认择吉 API 已构建
ls -la /var/www/miniapp/.next/server/app/api/zeji/
```

### 2.3 API 测试

#### 测试本地访问
```bash
# 测试择吉 API
curl "http://localhost:3000/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"

# 测试黄历 API
curl "http://localhost:3000/api/calendar?date=2026-01-12"
```

#### 测试公网访问
```bash
# 测试择吉 API
curl "https://www.dralexlp.com/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"

# 测试黄历 API
curl "https://www.dralexlp.com/api/calendar?date=2026-01-12"
```

---

## 三、前端小程序部署

### 3.1 环境配置

配置文件：`/Users/huayin/miniprogram-1/config.js`

```javascript
module.exports = {
  // 开发环境
  development: {
    apiBase: 'http://localhost:3000',
    qrcodeUrl: '/images/qrcode.jpg'
  },

  // 生产环境
  production: {
    apiBase: 'https://www.dralexlp.com',
    qrcodeUrl: '/images/qrcode.jpg'
  }
};

// 当前环境（开发时改为 'development'，上线时改为 'production'）
const ENV = 'production';  // ⚠️ 上线前必须改为 'production'

module.exports.current = module.exports[ENV];
```

**重要提醒**：
- ✅ 本地开发时：`ENV = 'development'`
- ✅ 上线部署时：`ENV = 'production'`
- ❌ 忘记切换会导致小程序无法连接生产服务器

### 3.2 发布流程

#### 步骤1：确保后端已部署
```bash
# 测试生产环境 API 是否正常
curl "https://www.dralexlp.com/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"
```

#### 步骤2：修改小程序配置
1. 打开 `/Users/huayin/miniprogram-1/config.js`
2. 将 `const ENV = 'production';`
3. 保存文件

#### 步骤3：提交代码到 GitHub
```bash
cd /Users/huayin/miniprogram-1
git add .
git commit -m "feat: 配置生产环境，准备发布"
git push origin claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R
```

#### 步骤4：使用微信开发者工具上传
1. 打开微信开发者工具
2. 确保项目编译无错误
3. 点击右上角"上传"按钮
4. 填写版本号（如：1.0.0）和项目备注
5. 点击"上传"

#### 步骤5：提交审核
1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发管理" → "开发版本"
3. 找到刚上传的版本，点击"提交审核"
4. 填写审核信息并提交

---

## 四、择吉功能详细说明

### 4.1 功能概述

择吉功能允许用户选择特定事项（如开市、嫁娶等），然后搜索指定日期范围内适合该事项的吉日。

### 4.2 API 端点

**请求地址**：`GET /api/zeji`

**请求参数**：
| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| item | string | 是 | 择吉事项 | "开市" |
| startDate | string | 是 | 起始日期 (YYYY-MM-DD) | "2026-01-12" |
| endDate | string | 是 | 结束日期 (YYYY-MM-DD) | "2026-02-11" |
| offset | number | 否 | 分页偏移量 | 0 |
| limit | number | 否 | 每页数量（默认30） | 30 |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "item": "开市",
    "results": [
      {
        "date": "2026-01-13",
        "solar": {
          "year": 2026,
          "month": 1,
          "day": 13,
          "weekday": "二"
        },
        "lunar": {
          "monthDay": "冬月廿五",
          "ganZhi": "乙巳年 己丑月 丁亥日"
        },
        "zhiShen": "明堂"
      }
    ],
    "hasMore": true,
    "nextOffset": 30
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 4.3 支持的事项列表（共89项）

#### 常用/热门（8项）
嫁娶、入宅、移徙、开市、交易、安床、订盟、纳采

#### 商业工作（6项）
立券、纳财、出货财、开仓、进人口、赴任

#### 装修建造（6项）
动土、修造、上梁、盖屋、起基、竖柱

#### 生活日常（8项）
祭祀、祈福、沐浴、理发、扫舍、裁衣、会亲友、出行

#### 其他事项（61项）
安葬、安门、安香、安机械、补垣、成服、出火、除服、冠笄、挂匾、坏垣、纳畜、架马、结网、解除、掘井、开池、开光、开厕、开渠、开生坟、启钻、取渔、破屋、破土、平治道涂、栽种、塞穴、塑绘、求嗣、求医、伐木、放水、畋猎、拆卸、断蚁、定磉、斋醮、筑堤、治病、针灸、整手足甲、置产、捕捉、经络、教牛马、牧养、立碑、谢土、修坟、修门、修饰垣墙、移柩、入殓、入学、造仓、造畜稠、造船、作梁、作灶

### 4.4 筛选规则

- ✅ **包含条件**：黄历"宜"中包含所选事项
- ❌ **排除条件**：排除包含"诸事不宜"或"馀事勿取"的日期
- 📅 **范围限制**：日期范围最多 1 年（365 天）
- 📄 **分页机制**：每次返回最多 30 个结果，支持加载更多

### 4.5 小程序页面结构

```
pages/
├── zeji/                    # 择吉事项选择页
│   ├── zeji.js
│   ├── zeji.wxml
│   ├── zeji.wxss
│   └── zeji.json
└── zeji-result/            # 择吉结果页
    ├── zeji-result.js
    ├── zeji-result.wxml
    ├── zeji-result.wxss
    └── zeji-result.json
```

---

## 五、故障排查

### 5.1 后端服务问题

#### 问题：服务启动失败（Exit 1）

**症状**：运行 `npm run start` 后进程立即退出

**可能原因及解决方法**：

**原因1：端口被占用**
```bash
# 检查端口占用
netstat -tulpn | grep 3000

# 找到占用端口的进程
lsof -i :3000

# 停止进程
kill -9 <PID>
```

**原因2：项目未构建或构建过期**
```bash
# 检查构建目录
ls -la /var/www/miniapp/.next

# 如果没有或很旧，重新构建
cd /var/www/miniapp
npm run build

# 构建成功后重启
nohup npm run start > nohup.out 2>&1 &
```

**原因3：依赖包未安装**
```bash
# 重新安装依赖
cd /var/www/miniapp
rm -rf node_modules
npm install
npm run build
```

#### 问题：API 返回 404 Not Found

**症状**：访问 `/api/zeji` 返回 404

**诊断步骤**：
```bash
# 1. 确认服务正在运行
ps aux | grep next-server

# 2. 确认 API 路由文件存在
ls -la /var/www/miniapp/app/api/zeji/route.ts

# 3. 确认构建包含了 API 路由
ls -la /var/www/miniapp/.next/server/app/api/zeji/

# 4. 查看构建日志
npm run build 2>&1 | grep zeji
```

**解决方法**：
```bash
# 重新构建并重启
cd /var/www/miniapp
npm run build
ps aux | grep next-server  # 找到 PID
kill -9 <PID>
nohup npm run start > nohup.out 2>&1 &
```

#### 问题：服务运行但无响应

**症状**：服务进程存在但无法访问

**检查步骤**：
```bash
# 1. 检查服务日志
tail -100 /var/www/miniapp/nohup.out

# 2. 检查端口监听
netstat -tulpn | grep 3000

# 3. 本地测试
curl http://localhost:3000/api/calendar

# 4. 检查 Nginx 配置
nginx -t
```

### 5.2 小程序连接问题

#### 问题：小程序显示"网络错误"

**完整排查清单**：

**步骤1：确认后端服务正常**
```bash
# 在服务器上测试
curl "https://www.dralexlp.com/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"

# 应该返回 JSON 数据，而不是 404 或 HTML
```

**步骤2：检查小程序配置**
```javascript
// 检查 config.js
const ENV = 'production';  // ⚠️ 必须是 'production'

// 检查 production 配置
production: {
  apiBase: 'https://www.dralexlp.com',  // ⚠️ 必须是 HTTPS
}
```

**步骤3：检查微信小程序后台配置**
1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发管理" → "开发设置"
3. 检查"服务器域名"是否包含：
   - request合法域名：`https://www.dralexlp.com`
4. 如果没有，点击"修改"添加域名

**步骤4：检查微信开发者工具**
- 确保未勾选"不校验合法域名"（体验版和正式版会校验）
- 清除缓存并重新编译

**步骤5：查看小程序控制台日志**
```javascript
// 在 zeji-result.js 中已有详细日志
console.log('[择吉结果] 请求URL:', requestUrl);
console.log('[择吉结果] 响应数据:', JSON.stringify(res.data));
```

#### 问题：小程序显示"搜索失败"

**原因分析**：
- 后端返回了错误（HTTP 200 但 success: false）
- 参数验证失败
- 服务器内部错误

**排查方法**：
```bash
# 1. 检查服务器日志
tail -f /var/www/miniapp/nohup.out

# 2. 手动测试 API
curl "https://www.dralexlp.com/api/zeji?item=开市&startDate=2026-01-12&endDate=2026-02-11"

# 注意：URL 编码
curl "https://www.dralexlp.com/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"
```

### 5.3 性能问题

#### 问题：API 响应慢

**原因**：
- 日期范围太大（接近1年）
- 服务器资源不足

**优化方案**：
1. 使用分页加载（已实现）
2. 限制日期范围（已限制最多1年）
3. 考虑添加缓存机制

#### 问题：服务器内存不足

**检查内存使用**：
```bash
# 查看内存使用
free -h

# 查看 Node.js 进程内存
ps aux | grep next-server
```

**解决方法**：
- 升级服务器配置
- 使用 PM2 管理进程并设置内存限制
- 定期重启服务

---

## 六、最佳实践

### 6.1 版本管理

#### Git 工作流
```bash
# 开发新功能
git checkout -b feature/new-feature
# 开发完成后
git add .
git commit -m "feat: 添加新功能"
git push origin feature/new-feature

# 合并到主分支
git checkout claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R
git merge feature/new-feature
git push origin claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R
```

#### 提交信息规范
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构代码
- `test:` 测试相关
- `chore:` 构建/工具配置

### 6.2 标准部署流程

**完整部署检查清单**：

- [ ] 1. 本地开发和测试完成
- [ ] 2. 代码提交到 GitHub
- [ ] 3. SSH 登录服务器
- [ ] 4. 拉取最新代码 (`git pull`)
- [ ] 5. 安装依赖 (`npm install`)
- [ ] 6. 构建项目 (`npm run build`)
- [ ] 7. 停止旧服务 (`kill -9 <PID>`)
- [ ] 8. 启动新服务 (`nohup npm run start &`)
- [ ] 9. 验证服务启动 (`ps aux | grep next-server`)
- [ ] 10. 测试 API（本地）(`curl http://localhost:3000/api/zeji?...`)
- [ ] 11. 测试 API（公网）(`curl https://www.dralexlp.com/api/zeji?...`)
- [ ] 12. 更新小程序配置为 production
- [ ] 13. 提交小程序代码
- [ ] 14. 使用微信开发者工具上传
- [ ] 15. 在小程序后台提交审核

### 6.3 监控和日志

#### 实时监控
```bash
# 持续监控服务日志
tail -f /var/www/miniapp/nohup.out

# 监控错误日志
tail -f /var/www/miniapp/nohup.out | grep -i error

# 监控 API 请求
tail -f /var/www/miniapp/nohup.out | grep -i "api/zeji"
```

#### 日志分析
```bash
# 统计错误数量
grep -i error /var/www/miniapp/nohup.out | wc -l

# 查找特定错误
grep "EADDRINUSE" /var/www/miniapp/nohup.out

# 查看最近的错误（最后50行）
grep -i error /var/www/miniapp/nohup.out | tail -50
```

#### 定期维护
```bash
# 每周检查服务状态
ps aux | grep next-server

# 每月清理旧日志（保留最近1000行）
tail -1000 /var/www/miniapp/nohup.out > /tmp/nohup.out
mv /tmp/nohup.out /var/www/miniapp/nohup.out

# 每月检查磁盘空间
df -h
```

### 6.4 备份策略

#### 重要文件备份
```bash
# 备份环境变量
cp /var/www/miniapp/.env /var/www/miniapp/.env.backup

# 备份 Nginx 配置
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 备份数据库（如果有）
# mysqldump -u root -p database_name > backup.sql
```

#### 定期备份计划
- **每天**：自动备份数据库
- **每周**：备份配置文件
- **每月**：完整系统快照

### 6.5 安全最佳实践

- ✅ 使用 HTTPS（已配置）
- ✅ 定期更新依赖包 (`npm audit fix`)
- ✅ 配置防火墙规则
- ✅ 使用强密码和 SSH 密钥
- ⚠️ 不要在代码中硬编码密钥
- ⚠️ 定期审查服务器访问日志

---

## 七、进阶配置

### 7.1 使用 PM2 管理进程（推荐）

PM2 是专业的 Node.js 进程管理工具，比 nohup 更强大。

#### 安装 PM2
```bash
npm install -g pm2
```

#### PM2 配置文件
创建 `/var/www/miniapp/ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'bazi-life-mvp',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/miniapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

#### PM2 常用命令
```bash
# 启动应用
pm2 start ecosystem.config.js

# 重启应用
pm2 restart bazi-life-mvp

# 停止应用
pm2 stop bazi-life-mvp

# 查看状态
pm2 status

# 查看日志
pm2 logs bazi-life-mvp

# 查看实时日志
pm2 logs bazi-life-mvp --lines 100

# 设置开机自启
pm2 startup
pm2 save
```

#### 使用 PM2 部署
```bash
# 更新代码后
cd /var/www/miniapp
git pull
npm install
npm run build
pm2 restart bazi-life-mvp

# 或者零停机重启
pm2 reload bazi-life-mvp
```

### 7.2 Nginx 配置优化

检查 Nginx 配置：
```bash
cat /etc/nginx/sites-available/default
```

推荐配置：
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.dralexlp.com dralexlp.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.dralexlp.com dralexlp.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重启 Nginx：
```bash
nginx -t  # 测试配置
systemctl restart nginx
```

### 7.3 环境变量管理

创建 `/var/www/miniapp/.env` 文件：
```env
# 数据库
DATABASE_URL=mysql://username:password@host:3306/database

# AI 配置
AI_PROVIDER=deepseek
AI_API_KEY=your_api_key
AI_MODEL=deepseek-chat

# 其他配置
NODE_ENV=production
PORT=3000
```

**安全提醒**：
- ⚠️ 不要将 `.env` 文件提交到 Git
- ⚠️ 确保 `.env` 在 `.gitignore` 中
- ⚠️ 定期更换敏感密钥

---

## 八、常用命令速查表

### 快速部署（一键复制）
```bash
# 完整部署流程
cd /var/www/miniapp && \
git pull origin claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R && \
npm install && \
npm run build && \
pkill -9 -f next-server && \
nohup npm run start > nohup.out 2>&1 & \
sleep 3 && \
ps aux | grep next-server && \
curl "http://localhost:3000/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"
```

### 常用命令
```bash
# === 服务器登录 ===
ssh root@47.99.80.238

# === 进入项目目录 ===
cd /var/www/miniapp

# === 更新代码 ===
git pull origin claude/bazi-mvp-scaffold-011CUuWHawuHJVQG2HC3qA2R

# === 安装依赖 ===
npm install

# === 构建项目 ===
npm run build

# === 查找进程 ===
ps aux | grep next-server

# === 停止服务 ===
kill -9 <PID>

# === 启动服务 ===
nohup npm run start > nohup.out 2>&1 &

# === 查看日志 ===
tail -f nohup.out

# === 测试 API（本地） ===
curl "http://localhost:3000/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"

# === 测试 API（公网） ===
curl "https://www.dralexlp.com/api/zeji?item=%E5%BC%80%E5%B8%82&startDate=2026-01-12&endDate=2026-02-11"

# === 检查端口 ===
netstat -tulpn | grep 3000

# === 查看磁盘空间 ===
df -h

# === 查看内存使用 ===
free -h

# === 检查 Nginx ===
nginx -t
systemctl status nginx
```

---

## 九、技术支持

### 联系方式
- 开发者：Claude & 华银
- GitHub: [项目地址]

### 常见资源
- [Next.js 文档](https://nextjs.org/docs)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [PM2 文档](https://pm2.keymetrics.io/docs/)

### 遇到问题时
1. ✅ 查看本文档的"故障排查"部分
2. ✅ 检查服务器日志：`tail -f /var/www/miniapp/nohup.out`
3. ✅ 检查小程序控制台日志
4. ✅ 测试 API 是否正常返回数据
5. ✅ 在 GitHub 提交 Issue

---

## 十、附录

### 附录A：项目文件结构

```
/var/www/miniapp/              # 后端项目根目录
├── app/
│   ├── api/
│   │   ├── zeji/
│   │   │   └── route.ts      # 择吉 API
│   │   └── calendar/
│   │       └── route.ts      # 黄历 API
│   └── ...
├── lib/
│   └── calendar-utils.js      # 黄历工具函数
├── .next/                     # 构建产物（由 npm run build 生成）
├── node_modules/              # 依赖包
├── .env                       # 环境变量（不提交到 Git）
├── package.json               # 项目配置
└── nohup.out                  # 服务日志

/Users/huayin/miniprogram-1/   # 小程序项目根目录
├── pages/
│   ├── zeji/                  # 择吉选择页
│   └── zeji-result/           # 择吉结果页
├── config.js                  # 环境配置 ⚠️ 重要
└── app.json                   # 小程序配置
```

### 附录B：API 完整列表

| API 路径 | 方法 | 说明 | 状态 |
|----------|------|------|------|
| /api/calendar | GET | 获取黄历数据 | ✅ |
| /api/calendar/month | GET | 获取月历数据 | ✅ |
| /api/zeji | GET | 搜索吉日 | ✅ |
| /api/config | GET | 获取配置 | ✅ |
| /api/reports | POST | 创建报告 | ✅ |

### 附录C：更新日志

#### v1.1.0 (2026-01-12)
- ✨ 新增择吉功能
- ✨ 支持 89 种择吉事项
- ✨ 新增分页加载
- 📝 完善部署文档

#### v1.0.0 (2025-12-27)
- 🎉 初始版本发布
- ✅ 黄历功能
- ✅ 运势功能

---

**文档版本**：v2.0
**最后更新**：2026-01-12
**维护者**：Claude & 华银

---

**📌 提示**：建议打印或保存本文档，以便在服务器维护时快速查阅。
