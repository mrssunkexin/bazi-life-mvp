# 小程序订阅消息替代方案

## 背景

由于公众号是**订阅号**，不支持模板消息功能，我们可以改用**小程序订阅消息**实现报告发布通知。

## 订阅消息 vs 模板消息

| 特性 | 公众号模板消息 | 小程序订阅消息 |
|------|--------------|--------------|
| 适用账号 | 仅服务号 | 所有小程序 |
| 用户授权 | 关注公众号即可 | 需用户主动订阅 |
| 发送次数 | 无限制 | 每次订阅消耗1次 |
| 跳转能力 | 跳转小程序 | 跳转小程序页面 |
| 开发成本 | 需配置服务器 | 无需服务器配置 |

## 实施方案

### 1. 申请订阅消息模板

**操作步骤**：
1. 登录[小程序后台](https://mp.weixin.qq.com)
2. 进入"订阅消息" → "公共模板库"
3. 搜索"报告生成通知"或类似模板
4. 选择合适的字段组合，例如：
   - **thing1**: 报告名称（如"八字命理分析"）
   - **thing2**: 姓名
   - **time3**: 完成时间
   - **phrase4**: 状态（如"已完成"）

5. 提交审核，通过后获得模板ID（如 `a1b2c3d4e5...`）

### 2. 小程序端订阅流程

**修改文件**: `miniprogram-1/pages/form/form.js`（或提交表单的页面）

```javascript
// 在用户提交测算请求时，请求订阅权限
async function requestSubscribe() {
  try {
    const res = await wx.requestSubscribeMessage({
      tmplIds: ['模板ID_1', '模板ID_2'], // 可以一次订阅多个
      success: (res) => {
        console.log('订阅成功:', res);
        // res[模板ID] 的值:
        // 'accept' - 用户同意
        // 'reject' - 用户拒绝
        // 'ban' - 已被后台封禁
      },
      fail: (err) => {
        console.log('订阅失败:', err);
      }
    });
  } catch (error) {
    console.error('请求订阅权限失败:', error);
  }
}

// 在表单提交时调用
Page({
  async onSubmit(e) {
    // 1. 先请求订阅权限
    await requestSubscribe();

    // 2. 再提交表单数据
    const formData = e.detail.value;
    // ... 提交逻辑
  }
});
```

### 3. 后端发送订阅消息

**新建文件**: `lib/wechat/subscribe-message.ts`

```typescript
import { getAccessToken } from './access-token-manager';

interface SubscribeMessageParams {
  openid: string;          // 小程序用户openid
  templateId: string;      // 订阅消息模板ID
  reportId: string;
  reportType: 'basic' | 'fortune2026';
  userName: string;
  publishTime: Date;
}

/**
 * 发送小程序订阅消息
 */
export async function sendSubscribeMessage(params: SubscribeMessageParams): Promise<boolean> {
  const { openid, templateId, reportId, reportType, userName, publishTime } = params;

  try {
    // 1. 获取小程序access_token（使用小程序配置）
    const accessToken = await getMiniProgramAccessToken();

    // 2. 构建消息体
    const message = {
      touser: openid,
      template_id: templateId,
      page: `/pages/result/result?reportId=${reportId}&type=${reportType}`,
      data: {
        thing1: { value: reportType === 'basic' ? '八字命理分析' : '2026年运势报告' },
        thing2: { value: userName },
        time3: { value: formatDateTime(publishTime) },
        phrase4: { value: '已完成' }
      }
    };

    // 3. 发送请求
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    const result = await response.json();

    if (result.errcode === 0) {
      console.log('✅ 订阅消息发送成功');
      return true;
    } else {
      console.error('❌ 订阅消息发送失败:', result.errmsg);
      return false;
    }
  } catch (error) {
    console.error('❌ 发送订阅消息异常:', error);
    return false;
  }
}

/**
 * 获取小程序access_token
 */
async function getMiniProgramAccessToken(): Promise<string> {
  const WECHAT_APPID = process.env.WECHAT_APPID || '';
  const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`获取access_token失败: [${data.errcode}] ${data.errmsg}`);
  }

  return data.access_token;
}

function formatDateTime(date: Date): string {
  return date.toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');
}
```

### 4. 修改报告发布接口

**修改文件**: `app/api/reports/[id]/route.ts`

```typescript
import { sendSubscribeMessage } from '@/lib/wechat/subscribe-message';

// 在 PATCH 方法中，将 sendTemplateMessage 改为 sendSubscribeMessage
if (isNewlyPublished) {
  console.log('📢 触发小程序订阅消息推送');

  sendSubscribeMessage({
    openid: currentReport.user!.openid,  // 使用小程序openid
    templateId: process.env.WECHAT_SUBSCRIBE_TEMPLATE_ID || '',
    reportId: report.id,
    reportType: 'basic',
    userName: report.name,
    publishTime: report.publishAt || new Date()
  }).catch(err => {
    console.error('订阅消息发送失败:', err);
  });
}
```

**同样修改**: `app/api/fortune-2026/[id]/route.ts`

### 5. 环境变量配置

**添加到 `.env`**:

```bash
# 订阅消息模板ID（从小程序后台获取）
WECHAT_SUBSCRIBE_TEMPLATE_ID="你的订阅消息模板ID"
```

## 用户体验流程

1. 用户在小程序填写测算信息
2. 提交时弹出订阅授权对话框："xxx想给您发送'报告生成通知'，是否允许？"
3. 用户点击"允许"
4. 管理员在后台点击"发布报告"
5. 用户收到小程序订阅消息通知
6. 点击消息直接跳转到报告详情页

## 优点

✅ **无需公众号** - 订阅号/服务号都不需要
✅ **无需域名** - 不需要配置服务器回调
✅ **开发简单** - 只需调用API，无需webhook
✅ **用户熟悉** - 小程序订阅消息很常见

## 缺点

❌ **需要用户主动订阅** - 每次提交测算时都要授权一次
❌ **消耗订阅次数** - 每发送一次消耗一次授权（但可以一次授权多个模板）
❌ **推送能力有限** - 不如公众号模板消息灵活

## 推荐方案

如果你的公众号**无法升级到服务号**，强烈建议使用小程序订阅消息方案：
- 开发成本低
- 用户体验好
- 完全满足报告发布通知需求

---

## 下一步

告诉我你的决定：
1. **升级公众号到服务号**（需企业资质）
2. **改用小程序订阅消息**（我帮你实现）
3. **暂不实现推送功能**（手动通知用户）
