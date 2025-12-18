# 微信云托管网络访问问题排查与解决

## 问题现象

小程序体验版登录失败，报错：
```
HTTP 500: fetch failed
网络连接失败，云托管服务无法访问微信API
```

## 问题原因

微信云托管容器**无法访问外网API**（如 `api.weixin.qq.com`），导致无法调用微信登录接口换取 openid。

## 排查步骤

### 1. 测试网络连通性

访问网络诊断接口：
```bash
curl https://zhibaitang-bazisever-207188-4-1391586262.sh.run.tcloudbase.com/api/test/network | jq '.'
```

**预期结果**：
- ✅ 如果能访问微信API：`"hasInternetAccess": true`
- ❌ 如果无法访问：`"hasInternetAccess": false`

### 2. 查看详细错误日志

登录 [微信云托管控制台](https://cloud.weixin.qq.com) 查看实时日志，搜索关键词：
- `网络请求失败`
- `fetch failed`
- `ENOTFOUND`
- `ETIMEDOUT`

---

## 解决方案

### 方案1：开启云托管公网访问（推荐）

**操作步骤**：

1. 登录微信云托管控制台：https://cloud.weixin.qq.com
2. 选择服务：`zhibaitang-bazisever`
3. 进入"服务配置" → "网络设置"
4. 找到"公网访问"或"NAT网关"配置
5. **开启公网出站能力**

**配置示例**（根据实际界面调整）：
```
☑️ 启用公网访问
☑️ 允许容器访问外部网络
```

**注意**：
- 开启后可能需要重新部署服务
- 某些区域可能需要额外配置 NAT 网关

---

### 方案2：使用 HTTP 代理（备选）

如果云托管不支持直接公网访问，可以配置 HTTP 代理。

**步骤**：

1. 在云托管控制台添加环境变量：
```
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
```

2. 修改代码使用代理（需要安装 `undici` 或配置 Node.js 全局代理）

---

### 方案3：使用云函数代理（临时方案）

创建一个云函数作为代理，转发微信API请求。

**云函数代码**（`wechat-proxy`）：
```javascript
exports.main = async (event) => {
  const { code } = event;
  const APPID = process.env.WECHAT_APPID;
  const SECRET = process.env.WECHAT_SECRET;

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
};
```

**修改后端调用**（`app/api/auth/wechat/route.ts`）：
```typescript
// 调用云函数代理
const wxData = await wx.cloud.callFunction({
  name: 'wechat-proxy',
  data: { code }
});
```

---

## 验证修复

### 1. 测试登录接口

```bash
curl -X POST https://zhibaitang-bazisever-207188-4-1391586262.sh.run.tcloudbase.com/api/auth/wechat \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code_from_miniprogram"}'
```

**成功响应**（code错误但能访问API）：
```json
{
  "success": false,
  "error": "微信登录失败: invalid code",
  "code": "SERVER_ERROR"
}
```

**失败响应**（网络无法访问）：
```json
{
  "success": false,
  "error": "网络连接失败，云托管服务无法访问微信API。请检查服务配置或联系管理员。",
  "code": "SERVER_ERROR"
}
```

### 2. 测试小程序登录

1. 在小程序 `config.js` 设置 `ENV = 'production'`
2. 上传新版本或真机预览
3. 查看控制台日志，应该看到：
```
✅ 微信登录成功: { userId: 'xxx', openid: 'xxx' }
```

---

## 常见错误码

### ENOTFOUND
- **原因**: DNS 解析失败，无法找到 `api.weixin.qq.com`
- **解决**: 检查云托管 DNS 配置，或使用 IP 直接访问

### ETIMEDOUT
- **原因**: 网络超时，防火墙拦截
- **解决**: 开启公网访问权限，检查安全组规则

### fetch failed
- **原因**: Node.js 无法发起 HTTP 请求
- **解决**: 确认 Node.js 版本（20+），检查网络配置

---

## 微信云托管网络架构说明

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ 小程序      │ ────▶ │ 云托管容器   │ ────▶ │ 微信API     │
│ wx.cloud    │       │ (内网)       │       │ (外网)      │
└─────────────┘       └──────────────┘       └─────────────┘
                           │
                           │ 需要开启
                           ▼
                      ┌──────────┐
                      │ NAT网关  │
                      │ 公网出口 │
                      └──────────┘
```

**关键点**：
- 云托管容器默认只有内网访问能力
- 访问外部API（微信/OpenAI等）需要配置公网出口
- 小程序通过 `wx.cloud.callContainer` 访问云托管是内网通信，不受影响

---

## 联系微信支持

如果以上方案都无法解决，可以：

1. **提交工单**：
   - 登录云托管控制台
   - 点击右上角"帮助与反馈"
   - 提交工单，说明问题

2. **社区求助**：
   - 访问微信开放社区：https://developers.weixin.qq.com/community
   - 搜索"云托管 网络访问"相关问题

3. **官方文档**：
   - 云托管网络配置：https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/

---

## 部署检查清单

修复完成后，逐项确认：

- [ ] 云托管服务已开启公网访问
- [ ] 网络诊断接口测试通过（`/api/test/network`）
- [ ] 登录接口能正常调用微信API
- [ ] 小程序能成功登录并获取 userId
- [ ] 数据库连接正常（报告列表接口可用）
- [ ] 环境变量配置正确

---

## 备注

- 本文档创建时间：2025-12-14
- 云托管环境：`zhibaitang-3g85tzfpc7281bc7`
- 服务名称：`zhibaitang-bazisever`
- 当前版本：`zhibaitang-bazisever-018`
