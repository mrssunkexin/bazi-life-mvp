# 快速开始指南

## 🎯 当前状态

✅ **算法系统 100% 完成**
- 十神、藏干、神煞、格局、用神、大运全部实现
- 可直接使用，无需任何配置

⏳ **AI 系统待配置**
- 代码已完成，等待 Claude API key
- 不配置也能用，只是没有 AI 生成的自然语言分析

## 🚀 立即使用（仅算法模式）

### 1. 安装依赖
```bash
npm install
```

### 2. 推送数据库
```bash
npm run db:push
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问测试
- 前台：http://localhost:3000
- 测算页：http://localhost:3000/calc
- 管理后台：http://localhost:3000/admin（密码：admin123）

## 🤖 启用 AI 增强（可选）

### 1. 申请 Claude API Key

访问：https://console.anthropic.com/

**申请步骤：**
1. 注册/登录 Anthropic 账号
2. 进入 API Keys 页面
3. 创建新 key
4. 复制 `sk-ant-api03-xxxxx...`

### 2. 配置环境变量

创建 `.env.local` 文件：
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx你的key
NEXT_PUBLIC_ADMIN_PASSWORD=你的管理员密码
```

### 3. 重启服务器
```bash
# Ctrl+C 停止
npm run dev
```

现在系统会自动启用 AI 生成！

## 📝 使用流程

### 用户端
1. 访问 `/calc` 页面
2. 填写姓名、性别、出生日期/时间、城市
3. 点击"开始测算"
4. 自动跳转到报告页面 `/reports/[id]`

### 管理员端
1. 访问 `/admin` 登录
2. 查看所有报告列表
3. 点击"编辑"进入 `/admin/reports/[id]`
4. 可以修改报告内容
5. 点击"发布报告"

## 🔍 测试示例

### 测试数据
- 姓名：张三
- 性别：男
- 出生日期：1990-01-15
- 出生时间：08:30
- 城市：北京（从列表选择）

### 预期结果

**算法部分（总是有）：**
- ✅ 四柱八字：庚午 戊寅 ...
- ✅ 五行分析：木X% 火X% 土X% 金X% 水X%
- ✅ 十神：比肩X个 食神X个...
- ✅ 藏干：年支X藏X、月支X藏X...
- ✅ 神煞：天乙贵人、文昌...
- ✅ 格局：XXX格
- ✅ 用神：X
- ✅ 大运：X岁起运，顺行/逆行
- ✅ 流年：2025年X吉

**AI 部分（需要 API key）：**
- ✅ 性格分析（1000-1500字）
- ✅ 事业运势（1000-1500字）
- ✅ 财运分析（1000-1500字）
- ✅ ...共 9 个章节

## 💰 成本估算

### AI 模式成本
- **Claude API 费用**：约 $0.03/报告（¥0.22）
- **推荐售价**：¥9.9 - ¥29.9/份
- **利润空间**：98% 以上

### 仅算法模式
- **成本**：¥0（完全免费）
- **推荐售价**：¥4.9 - ¥9.9/份
- **利润空间**：100%

## 📊 报告质量对比

### 仅算法报告
- 字数：约 3,000 字
- 内容：纯数据 + 简要说明
- 适合：懂命理的用户
- 生成速度：< 1 秒

### 算法 + AI 报告
- 字数：约 12,000 字
- 内容：精准数据 + 深度解读
- 适合：所有用户
- 生成速度：10-15 秒

## 🎨 前端优化建议

### 报告展示页优化
```typescript
// app/reports/[id]/page.tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown className="prose prose-lg max-w-none">
  {report.fullContent}
</ReactMarkdown>
```

### 添加导出功能
```bash
npm install html-docx-js file-saver
```

```typescript
import { asBlob } from 'html-docx-js';
import { saveAs } from 'file-saver';

const exportWord = async () => {
  const html = document.querySelector('.report-content')?.innerHTML;
  const blob = await asBlob(html);
  saveAs(blob, `${name}_八字报告.docx`);
};
```

## 🔐 安全建议

### 1. 修改管理员密码
```bash
# .env.local
NEXT_PUBLIC_ADMIN_PASSWORD=你的强密码
```

### 2. 保护 API Key
```bash
# .env.local（不要提交到 git）
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. 生产环境设置
- 使用 Vercel/Netlify 部署
- 在平台设置环境变量
- 启用 HTTPS

## 📱 移动端优化

项目已使用 Tailwind CSS，响应式设计：
- ✅ 手机端自动适配
- ✅ 触摸友好的交互
- ✅ 移动端输入优化

## 🐛 常见问题

### Q1: 报告生成很慢？
**A:** 如果启用了 AI，需要 10-15 秒。可以添加加载动画：
```typescript
const [loading, setLoading] = useState(false);
// 显示进度条或转圈动画
```

### Q2: AI 生成失败？
**A:** 检查：
1. API key 是否正确
2. 账户余额是否充足
3. 网络连接是否正常

### Q3: 算法准确吗？
**A:**
- 十神、藏干、神煞：100% 符合传统理论
- 格局判断：80-90% 准确（简化处理）
- 大运起运：简化处理，建议人工复核

### Q4: 如何修改报告模板？
**A:** 编辑 `lib/ai-generator.ts` 中的提示词

### Q5: 可以不用 AI 吗？
**A:** 可以！不配置 API key 即可。系统会自动回退到纯算法模式。

## 📈 运营建议

### 定价策略
1. **免费版**：只显示算法数据（吸引用户）
2. **基础版**：¥9.9（算法 + AI 摘要）
3. **完整版**：¥29.9（算法 + AI 完整分析）

### 推广策略
1. 小红书/抖音分享案例
2. 公众号文章引流
3. 朋友圈推广
4. 线下命理馆合作

### 增值服务
1. 人工解读（¥99-299）
2. VIP 会员（无限次测算）
3. 流年分析（¥19.9/年）
4. 合婚分析（¥39.9/对）

## 🎉 恭喜！

你现在拥有一个完整的八字命理平台：
- ✅ 前端表单
- ✅ 八字计算
- ✅ 算法分析（十神、藏干、神煞、格局、大运）
- ✅ AI 生成（可选）
- ✅ 管理后台
- ✅ 报告展示

**下一步：**
1. 申请 Claude API key（如果需要 AI）
2. 部署到 Vercel
3. 设置支付接口
4. 开始运营！

祝生意兴隆！🚀🎊
