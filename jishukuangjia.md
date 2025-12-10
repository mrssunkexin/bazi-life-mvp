# 八字分析系统 · 技术架构方案（V1 · 详细版 · A 级）

文档类型：技术架构设计（TAD）  
适用范围：后端、管理后台、小程序开发 & Claude Code 生成代码参考  
编写日期：2025-12-08  

---

## 1. 系统总览

### 1.1 系统组成

本系统由以下子系统构成：

1. **微信小程序（User App）**
   - 为最终用户提供：填写信息、激活报告、查看报告、查看历史记录等功能。

2. **后端服务（Server API）**
   - 技术栈：Node.js 18+ + TypeScript  
   - Web 框架：Express（或 NestJS，二选一即可）  
   - 提供统一 REST API：用户认证、报告管理、兑换码校验、漏斗统计等。

3. **关系型数据库（DB）**
   - MySQL 8.x  
   - 使用 ORM（推荐 Prisma / TypeORM）做对象映射与迁移。

4. **管理后台 Web（Admin Web）**
   - 技术栈：React + TypeScript + Vite + TailwindCSS  
   - 面向管理员 / 分析师，用于管理报告、兑换码、用户等。

5. **微信服务号通知模块（WeChat OA）**
   - 与小程序共属同一主体（后续可通过开放平台打通 unionid）  
   - 用于在报告发布后向用户发送“报告已完成”的模板消息，并跳转到小程序查看。

6. **缓存与会话层（可选，V1 可不实现）**
   - Redis：用于缓存会话、限流、部分查询结果等。

---

## 1.2 业务流程架构（文字版）

1. 用户打开小程序 → 首页。  
2. 点击【开始填写信息】 → 填写表单（姓名/性别/出生信息/城市/备注/可选兑换码）。  
3. 小程序调用 `wx.login()` 获取 code → 后端换取 `mp_openid`，创建/查询用户，返回 token。  
4. 填写页提交表单 → 调用 `POST /api/report/create-temp`。  
5. 后端：  
   - 写入 `reports` 表，状态 `pending_pay` 或 `pending_analysis`；  
   - 若请求里有兑换码，则校验：有效→绑定 report 与兑换码；无效→记录无效状态；  
   - 写入 `funnel_logs` 记录关键步骤（form_submitted / code_valid / code_invalid / pending_pay_no_code 等）。  
6. 若兑换码有效 → 前端跳转“正在分析中”页，并提示关注服务号。  
7. 管理后台：  
   - 分析师登录后查看 `pending_analysis` 报告；  
   - 在编辑页填写 Markdown 报告内容；  
   - 保存草稿 / 发布报告。  
8. 发布报告时：  
   - 更新 `reports.status = 'published'` & `published_at`；  
   - 调用服务号模板消息接口：推送“报告已完成”，附带跳转小程序的路径。  
9. 用户点击通知或在小程序历史记录中 → 拉取 `GET /api/report/:id` 查看完整报告。  

---

## 2. 技术选型与通用约定

### 2.1 语言与框架

- 统一使用 **TypeScript** 编写后端与管理端代码。  
- 小程序可使用 JavaScript 或 TypeScript，推荐 TS。

**后端：**  
- Node.js 18+  
- Express + TypeScript + Prisma + MySQL（或 NestJS 替代 Express）  

**管理后台：**  
- React 18 + Vite + React Router + TailwindCSS  

**小程序：**  
- 微信小程序原生框架（WXML/WXSS/JS or TS）  

### 2.2 统一返回格式

接口返回统一结构：

```jsonc
{
  "success": true,
  "data": { },
  "error": {
    "code": "",
    "message": ""
  }
}
```

约定：  
- 正常成功：`success=true`，`data` 为具体内容，`error` 为空对象或 null。  
- 业务错误：`success=false`，`error.code` 为业务错误码，`error.message` 为前端可直接展示的文案。  

### 2.3 认证与授权

- 小程序 & 管理端均使用 JWT（HS256）认证。  
- Token 放在 `Authorization: Bearer <token>` 头部。  
- 小程序端 token 存储于 `wx.setStorageSync`；管理端存于 `localStorage`。  
- 所有敏感接口必须通过鉴权中间件校验：  
  - 小程序接口校验 `userId`。  
  - 管理端接口校验 `adminId` & 角色（role）。  

### 2.4 错误码规范（建议）

| 业务模块 | 错误码前缀 | 示例                      |
|----------|------------|---------------------------|
| 通用     | COMMON_    | COMMON_UNKNOWN            |
| 鉴权     | AUTH_      | AUTH_EXPIRED              |
| 报告     | REPORT_    | REPORT_NOT_FOUND          |
| 兑换码   | REDEEM_    | REDEEM_INVALID / REDEEM_USED |
| 管理端   | ADMIN_     | ADMIN_PERMISSION_DENIED   |

---

## 3. 小程序技术架构

### 3.1 目录结构（建议）

```text
miniprogram/
  app.ts
  app.json
  app.wxss
  project.config.json

  config.ts          # 基础配置（API 域名、版本等）

  /utils
    request.ts       # 对 wx.request 封装，自动注入 token & 错误处理
    auth.ts          # 登录、获取 token、检查登录状态
    format.ts        # 时间/日期/文本格式化工具
    storage.ts       # 本地缓存封装（wx.setStorage）

  /services          # 与后端 API 对应的服务封装
    auth.ts
    report.ts
    user.ts

  /pages
    /home            # 首页
    /form            # 填写信息 + 兑换码
    /pending         # 正在分析中
    /report          # 报告详情页
    /history         # 历史报告列表
    /settings        # 设置/隐私/关注服务号入口（可选）
```

### 3.2 登录与会话管理

#### 3.2.1 登录流程

1. 启动时在 `app.onLaunch` 中调用 `wx.login()` 获取 `code`。  
2. 将 `code` 发送到后端 `POST /api/mp/auth/login`：  
   - 后端请求微信小程序接口换取 `mp_openid`、`session_key`；  
   - 在 `users` 表中查询/创建用户；  
   - 返回：`token`、`user` 对象。  
3. 在小程序本地缓存 `token` 和 `user`。  
4. 所有需要用户身份的接口，通过封装的 `request` 模块自动带上 `Authorization` 头。  

#### 3.2.2 token 失效处理

- 若接口响应返回 `401` 或错误码 `AUTH_EXPIRED`：  
  - 清空本地 token；  
  - 重新触发登录流程（wx.login → /api/mp/auth/login）；  
  - 若多次失败则弹窗提示“登录状态失效，请稍后重试”。  

### 3.3 API 请求封装

`utils/request.ts` 需实现：

- 支持：`get(url, params?)` / `post(url, data?)` / `put(url, data?)` / `del(url, data?)`。  
- 自动拼接后端域名。  
- 在 header 中注入 `Authorization`（如有 token）。  
- 统一处理：  
  - 网络错误 → toast 提示。  
  - 业务错误 → 根据 `error.code` 显示不同文案。  

### 3.4 页面逻辑要点

#### 3.4.1 首页 `/pages/home`

- 内容：标题、说明文案、【开始填写信息】按钮、【查看历史报告】按钮、协议入口。  
- 行为：  
  - `onLoad`：可不强制登录。  
  - 点击【开始填写信息】 → `wx.navigateTo('/pages/form/index')`。  
  - 点击【查看历史报告】 → `wx.navigateTo('/pages/history/index')`。  

#### 3.4.2 填写页 `/pages/form`

- `onLoad` 时检查是否已有 token，无则触发登录流程。  
- 表单字段：姓名、性别、出生日期、出生时间、城市、备注、兑换码。  
- 点击【生成报告】：  
  1. 做必填校验（日期、时间、城市等）。  
  2. 调用 `services.report.createTemp(formData)`；  
  3. 根据接口返回：  
     - `status='pending_analysis' & codeStatus='valid'` → 跳转 pending。  
     - `status='pending_pay' & codeStatus='none'` → 弹窗提示需激活。  
     - `codeStatus='invalid'` → 弹窗提示兑换码无效。  

- 补录兑换码：  
  - 用户在同一页面输入兑换码后，点击【确认使用】按钮；  
  - 调用 `services.report.applyRedeem(reportId, code)`；  
  - 兑换成功 → 更新 UI 状态并跳转 pending。  

#### 3.4.3 等待页 `/pages/pending`

- 接收 `reportId`。  
- 显示：报告编号、创建时间、状态文案。  
- 提示用户“关注服务号获取通知”。  
- 可配置轮询逻辑（可选）。  

#### 3.4.4 报告页 `/pages/report`

- 通过入参 `reportId` 调用 `/api/report/:id` 拉取报告详情。  
- 使用富文本或 Markdown 组件渲染 `content_markdown`。  
- 对于非 `published` 状态：提示“报告仍在分析中，请稍后查看”。  

#### 3.4.5 历史页 `/pages/history`

- 调用 `/api/report/list` 获取当前用户所有报告（仅基础信息）。  
- 支持下拉刷新。  
- 点击一条记录 → 进入 `/pages/report/index?reportId=...`。  

---

## 4. 后端技术架构

### 4.1 技术栈

- Node.js 18+  
- TypeScript  
- Express (或 NestJS)  
- Prisma (或 TypeORM) + MySQL  
- JWT  
- axios  

### 4.2 项目目录结构（Express + TS 示例）

```text
server/
  src/
    main.ts

    config/
      index.ts
      db.ts
      wechat.ts

    middleware/
      auth.ts
      adminAuth.ts
      errorHandler.ts
      logger.ts
      validate.ts

    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.types.ts

      user/
        user.controller.ts
        user.service.ts
        user.types.ts

      report/
        report.controller.ts
        report.service.ts
        report.types.ts

      redeem/
        redeem.controller.ts
        redeem.service.ts
        redeem.types.ts

      admin/
        admin.controller.ts
        admin.service.ts
        admin.types.ts

      wechat/
        wechat.service.ts
        wechat.types.ts

    routes/
      mp.routes.ts
      admin.routes.ts
      index.ts

    utils/
      logger.ts
      jwt.ts
      crypto.ts
      response.ts
      error.ts

    prisma/
      schema.prisma

  package.json
  tsconfig.json
```

### 4.3 模块职责

- **auth 模块**：登录、token 签发与刷新。  
- **user 模块**：用户资料、手机号绑定。  
- **report 模块**：报告创建、查询、编辑、发布、状态机。  
- **redeem 模块**：兑换码生成、校验、绑定逻辑。  
- **admin 模块**：管理员登录、权限控制。  
- **wechat 模块**：封装与微信交互（服务号模板消息等）。  

### 4.4 中间件

1. `auth.ts`：小程序用户鉴权。  
2. `adminAuth.ts`：管理端鉴权 + 角色控制。  
3. `errorHandler.ts`：统一错误处理。  
4. `logger.ts`：请求日志。  
5. `validate.ts`：入参校验（可集成 `zod` 或 `joi`）。  

---

## 5. 管理后台技术架构

### 5.1 技术栈

- React 18  
- TypeScript  
- Vite  
- React Router  
- TailwindCSS / 组件库（Ant Design / MUI 等）  

### 5.2 目录结构

```text
admin-web/
  src/
    main.tsx
    App.tsx

    router/
      index.tsx

    api/
      axiosInstance.ts
      auth.ts
      report.ts
      redeem.ts
      user.ts

    pages/
      Login/
        index.tsx
      Reports/
        List.tsx
        Edit.tsx
        Detail.tsx
      Redeem/
        List.tsx
        BatchCreate.tsx
      Users/
        List.tsx
        Detail.tsx

    components/
      Layout/
      Table/
      Form/
      MarkdownEditor/
      MarkdownPreview/

    store/
      authStore.ts
      uiStore.ts
```

### 5.3 页面说明（简要）

- **Login**：管理员登录。  
- **Reports/List**：报告列表与筛选。  
- **Reports/Edit**：报告编辑页（左数据、右 Markdown 编辑 + 预览）。  
- **Redeem/List**：兑换码列表。  
- **Redeem/BatchCreate**：批量生成兑换码。  
- **Users/List & Detail**：用户列表与详情。  

---

## 6. 数据库设计

### 6.1 E-R 关系概览

- `users` 1 - n `reports`。  
- `users` 1 - n `funnel_logs`。  
- `redeem_codes` 1 - 1 `reports`（一个兑换码最多绑定一个报告）。  
- `users` 1 - n `redeem_codes`（通过 used_by_user_id）。  

### 6.2 表结构

#### 6.2.1 users 表

字段略（与 PRD 中一致，含 mp_openid / phone / unionid / 状态等）。

#### 6.2.2 reports 表

字段略（含状态、表单信息、八字信息、markdown 内容等）。

#### 6.2.3 redeem_codes 表

字段略（含 code、status、used_by_user_id、used_report_id 等）。

#### 6.2.4 funnel_logs 表

字段略（记录漏斗行为步骤）。

#### 6.2.5 admins 表

字段略（用户名、密码哈希、角色等）。

> 具体字段与类型请参考 PRD 文档中的“6. 数据 & 状态（产品视角）”章节，可直接转换为 Prisma 或 TypeORM 模型。

---

## 7. API 详细定义

### 7.1 小程序端 API

#### 7.1.1 POST /api/mp/auth/login

- 描述：小程序登录，获取用户 token。  
- 请求体：  
  ```json
  {
    "code": "wx_login_code"
  }
  ```
- 响应：  
  ```jsonc
  {
    "success": true,
    "data": {
      "token": "jwt_token_string",
      "user": {
        "id": 1,
        "mp_openid": "xxx",
        "phone": null
      }
    }
  }
  ```

#### 7.1.2 POST /api/report/create-temp

- 描述：用户提交表单，创建临时报告记录，进行初次兑换码校验。  
- 鉴权：需要用户登录。  
- 请求体：
  ```jsonc
  {
    "name": "张三",
    "gender": "male",
    "birthDate": "2000-01-01",
    "birthTime": "08:21",
    "city": "北京",
    "remark": "可选",
    "redeemCode": "ABC123"
  }
  ```
- 返回：
  ```jsonc
  {
    "success": true,
    "data": {
      "reportId": "r_123",
      "status": "pending_analysis",
      "codeStatus": "valid",
      "needPay": false,
      "needCode": false
    }
  }
  ```

#### 7.1.3 POST /api/report/apply-redeem

- 描述：用户在提交后补录兑换码。  
- 请求体：
  ```jsonc
  {
    "reportId": "r_123",
    "redeemCode": "ABC123"
  }
  ```
- 响应数据结构同 `create-temp`。

#### 7.1.4 GET /api/report/:id

- 描述：获取报告详情。  
- 鉴权：用户必须为报告所属 user。  

#### 7.1.5 GET /api/report/list

- 描述：获取当前用户报告列表。  
- 查询参数：  
  - `status`（可选）  
  - `page`、`pageSize`（分页）  

#### 7.1.6 POST /api/user/bind-phone（预留）

- 描述：绑定手机号（配合 `getPhoneNumber` 能力）。  

### 7.2 管理端 API（略，结构参考 PRD 中描述）

包含：

- POST /api/admin/login  
- GET /api/admin/reports  
- GET /api/admin/report/:id  
- PUT /api/admin/report/:id/save  
- POST /api/admin/report/:id/publish  
- POST /api/admin/redeem/batch  
- GET /api/admin/redeem/list  

---

## 8. 安全设计

- JWT 鉴权；  
- 管理员密码加盐哈希；  
- 报告读写权限控制；  
- 兑换码幂等使用；  
- 输入校验与长度限制。  

---

## 9. 性能与扩展

- 初期单实例部署即可；  
- 通过 Docker + Nginx 做水平扩展；  
- 为常用查询加索引；  
- 可使用 Redis 做缓存与限流。  

---

## 10. 部署与运维

- 后端：PM2 / Docker 部署，开启日志轮转；  
- 数据库：RDS，定期备份；  
- 管理前端：构建后部署为静态资源；  
- 小程序：微信开发者工具上传、审核、发布；  
- 日志：区分访问日志与错误日志，必要时接入监控系统（如 Sentry）。  

---

## 11. 扩展规划（V2+）

- 接入支付能力（需资质）  
- 报告海报生成功能  
- AI 草稿生成  
- 多分析师协作与绩效统计  
- 数据看板与运营报表  

---

> 本技术架构方案与 PRD 一起，构成该项目开发的主要依据。开发过程中若发现冲突或不足，应在评审后更新本方案。
