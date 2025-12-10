# 微信小程序部署指南

## 一、准备工作

### 1.1 安装开发工具（⭐ 可立即开始）
下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

**重要提示**：可以使用**测试号**进行开发，无需等待正式 AppID！

### 1.2 创建测试项目
1. 打开微信开发者工具
2. 点击"+"新建项目
3. **选择"测试号"**（不使用 AppID）
4. 填写项目名称和目录
5. 后端服务选择"不使用云服务"

此时可以进行完整的开发和调试，除了以下功能：
- 无法真机预览（可以用模拟器）
- 无法上传代码
- 无法调用部分需要认证的 API

### 1.3 部署后端 API
将现有 Next.js 应用部署到云平台（参考 DEPLOYMENT.md），获得后端 API 地址，例如：
```
https://bazi-life-api.zeabur.app
```

### 1.4 注册微信小程序账号（开发后期）
当开发基本完成，准备真机测试和上线时再注册：
1. 访问 [微信公众平台](https://mp.weixin.qq.com)
2. 注册小程序账号（需要企业或个人认证）
3. 获取 **AppID**（在"开发" > "开发管理" > "开发设置"中）
4. 在微信开发者工具中切换到正式 AppID

---

## 二、项目架构

```
bazi-life-mvp/              # 现有项目（作为后端 API）
├── app/api/                # API 路由保持不变
├── lib/                    # 八字计算逻辑保持不变
└── ...

bazi-life-miniprogram/      # 新建小程序项目
├── pages/                  # 小程序页面
│   ├── index/             # 首页（输入生辰信息）
│   ├── result/            # 报告结果页
│   └── my/                # 个人中心
├── components/            # 小程序组件
├── utils/                 # 工具函数
│   └── api.js            # 封装后端 API 调用
└── app.json              # 小程序配置
```

---

## 三、后端 API 改造

### 3.1 添加 CORS 支持

修改 `app/api` 中的路由，允许小程序跨域请求：

**创建 `/middleware.ts`：**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 允许小程序域名跨域
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 3.2 修改 API 路由返回格式

确保所有 API 返回统一的 JSON 格式：

```typescript
// 成功响应
{
  "success": true,
  "data": { ... }
}

// 错误响应
{
  "success": false,
  "error": "错误信息"
}
```

### 3.3 配置小程序服务器域名白名单

在微信公众平台 > 开发 > 开发管理 > 服务器域名中，添加后端 API 域名：

```
request 合法域名：https://bazi-life-api.zeabur.app
```

---

## 四、小程序前端开发

### 4.1 创建小程序项目

1. 打开微信开发者工具
2. 新建小程序项目
3. 选择 "不使用云服务"
4. 输入 AppID 和项目名称

### 4.2 核心页面开发

#### 页面 1：首页（输入表单）

**pages/index/index.wxml：**

```xml
<view class="container">
  <view class="form">
    <view class="form-item">
      <text>姓名</text>
      <input placeholder="请输入姓名" bindinput="onNameInput" value="{{name}}" />
    </view>

    <view class="form-item">
      <text>性别</text>
      <picker mode="selector" range="{{genderOptions}}" bindchange="onGenderChange">
        <text>{{genderOptions[genderIndex]}}</text>
      </picker>
    </view>

    <view class="form-item">
      <text>出生日期</text>
      <picker mode="date" bindchange="onDateChange">
        <text>{{birthDate || '请选择日期'}}</text>
      </picker>
    </view>

    <view class="form-item">
      <text>出生时间</text>
      <picker mode="time" bindchange="onTimeChange">
        <text>{{birthTime || '请选择时间'}}</text>
      </picker>
    </view>

    <view class="form-item">
      <text>出生城市</text>
      <input placeholder="如：北京" bindinput="onCityInput" value="{{city}}" />
    </view>

    <button class="submit-btn" bindtap="onSubmit">生成八字报告</button>
  </view>
</view>
```

**pages/index/index.js：**

```javascript
const api = require('../../utils/api.js');

Page({
  data: {
    name: '',
    genderOptions: ['男', '女'],
    genderIndex: 0,
    birthDate: '',
    birthTime: '',
    city: ''
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ genderIndex: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ birthDate: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ birthTime: e.detail.value });
  },

  onCityInput(e) {
    this.setData({ city: e.detail.value });
  },

  async onSubmit() {
    // 验证表单
    if (!this.data.name || !this.data.birthDate || !this.data.birthTime) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 显示加载
    wx.showLoading({ title: '生成中...' });

    try {
      // 调用后端 API
      const result = await api.generateReport({
        name: this.data.name,
        gender: this.data.genderOptions[this.data.genderIndex],
        birthDate: this.data.birthDate,
        birthTime: this.data.birthTime,
        city: this.data.city
      });

      wx.hideLoading();

      // 跳转到报告页面
      wx.navigateTo({
        url: `/pages/result/result?reportId=${result.data.id}`
      });

    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '生成失败', icon: 'none' });
    }
  }
});
```

#### 页面 2：报告结果页

**pages/result/result.wxml：**

```xml
<view class="container">
  <view class="report-header">
    <text class="title">{{report.title}}</text>
    <text class="date">{{report.createdAt}}</text>
  </view>

  <view class="basic-info">
    <text class="name">{{report.name}}</text>
    <text class="gender">{{report.gender}}</text>
    <text class="birth">{{report.birthDate}} {{report.birthTime}}</text>
  </view>

  <view class="bazi-pillars">
    <view class="pillar">
      <text class="label">年柱</text>
      <text class="value">{{report.baziYear}}</text>
    </view>
    <view class="pillar">
      <text class="label">月柱</text>
      <text class="value">{{report.baziMonth}}</text>
    </view>
    <view class="pillar">
      <text class="label">日柱</text>
      <text class="value">{{report.baziDay}}</text>
    </view>
    <view class="pillar">
      <text class="label">时柱</text>
      <text class="value">{{report.baziHour}}</text>
    </view>
  </view>

  <view class="summary">
    <text class="section-title">基本分析</text>
    <text class="content">{{report.basicSummary}}</text>
  </view>

  <view class="full-content">
    <rich-text nodes="{{report.fullContent}}"></rich-text>
  </view>
</view>
```

**pages/result/result.js：**

```javascript
const api = require('../../utils/api.js');

Page({
  data: {
    report: null
  },

  async onLoad(options) {
    const { reportId } = options;

    wx.showLoading({ title: '加载中...' });

    try {
      const result = await api.getReport(reportId);
      this.setData({ report: result.data });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
```

### 4.3 API 封装

**utils/api.js：**

```javascript
const API_BASE = 'https://bazi-life-api.zeabur.app';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.data.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.error || '请求失败'));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  // 生成报告
  generateReport(data) {
    return request('/api/reports', {
      method: 'POST',
      data
    });
  },

  // 获取报告详情
  getReport(id) {
    return request(`/api/reports/${id}`);
  }
};
```

---

## 五、部署流程

### 5.1 后端部署
1. 将 Next.js 应用部署到 Zeabur/Vercel（参考 DEPLOYMENT.md）
2. 确保获得固定域名：`https://your-app.zeabur.app`
3. 在小程序后台配置服务器域名白名单

### 5.2 小程序上传
1. 在微信开发者工具中点击"上传"
2. 填写版本号和备注
3. 登录微信公众平台 > 管理 > 版本管理
4. 提交审核
5. 审核通过后点击"发布"

### 5.3 审核注意事项
- 需要提供《增值电信业务经营许可证》或备案
- 命理测算类小程序需要特殊资质
- 建议定位为"娱乐"或"教育"类别
- 添加免责声明："本测算仅供娱乐参考"

---

## 六、成本估算

| 项目 | 费用 |
|------|------|
| 小程序认证费 | ¥300/年（企业）或免费（个人） |
| 后端服务器（Zeabur） | 免费额度或 ¥50-200/月 |
| MySQL 数据库 | 免费 5GB 或 ¥30-100/月 |
| DeepSeek API | ¥0.036/报告 × 月报告数 |

---

## 七、技术栈对比

| 层级 | 网页版 | 小程序版 |
|------|--------|----------|
| UI 层 | React + JSX | WXML + WXSS |
| 逻辑层 | JavaScript/TypeScript | JavaScript |
| 样式 | Tailwind CSS | WXSS（类似 CSS） |
| 路由 | Next.js App Router | 小程序原生路由 |
| 数据请求 | fetch/axios | wx.request |
| 状态管理 | React Hooks | 小程序 Page/Component |

---

## 八、常见问题

### Q1: 小程序能直接运行现有 Next.js 代码吗？
**A**: 不能。小程序是独立的运行环境，需要重新开发前端界面，但可以复用后端 API。

### Q2: 八字计算逻辑需要重写吗？
**A**: 不需要。所有计算逻辑保持在后端（lib/ 目录），小程序只负责收集用户输入并展示结果。

### Q3: 小程序能使用 npm 包吗？
**A**: 可以，但需要在微信开发者工具中"构建 npm"。已有的 `lunar-javascript` 库可以在小程序中使用。

### Q4: 如何处理 Markdown 内容？
**A**: 使用小程序的 `rich-text` 组件，或引入 `towxml` 等第三方库渲染 Markdown。

### Q5: 小程序支付如何集成？
**A**: 使用微信支付 API，需要在后端生成预支付订单，小程序调用 `wx.requestPayment`。

---

## 九、推荐开发流程

### 无 AppID 阶段（可立即开始）

1. **第一阶段（1-2天）**：后端 API 改造
   - 添加 CORS 支持
   - 统一返回格式
   - 部署到云平台

2. **第二阶段（3-5天）**：小程序基础开发
   - 使用**测试号**创建项目
   - 开发输入表单页面
   - 开发报告展示页面
   - 在**模拟器**中测试所有功能

3. **第三阶段（2-3天）**：UI/UX 优化
   - 完善样式和交互
   - 优化用户体验
   - 在模拟器中验证

### 获得 AppID 后

4. **第四阶段（申请小程序账号）**
   - 注册小程序账号（3-5天审核）
   - 在开发工具中切换到正式 AppID
   - 配置服务器域名白名单

5. **第五阶段（1-2天）**：真机测试
   - 使用真机预览功能
   - 修复真机特有问题
   - 邀请用户内测

6. **第六阶段（2-7天）**：提交审核上线
   - 上传代码
   - 提交审核
   - 发布上线

7. **第七阶段（按需）**：高级功能
   - 添加支付功能
   - 完善用户系统
   - 数据分析统计

---

## 十、测试号 vs 正式号对比

| 功能 | 测试号（无需 AppID） | 正式号（需要 AppID） |
|------|---------------------|---------------------|
| 本地开发 | ✅ 支持 | ✅ 支持 |
| 模拟器调试 | ✅ 支持 | ✅ 支持 |
| 真机预览 | ❌ 不支持 | ✅ 支持 |
| 上传代码 | ❌ 不支持 | ✅ 支持 |
| 发布上线 | ❌ 不支持 | ✅ 支持 |
| 调用后端 API | ✅ 支持 | ✅ 支持 |
| 微信登录 | ❌ 不支持 | ✅ 支持 |
| 微信支付 | ❌ 不支持 | ✅ 支持 |

**建议**：先用测试号完成 80% 的开发工作，再申请正式账号进行真机测试和上线。

---

更新时间：2025-12-08
