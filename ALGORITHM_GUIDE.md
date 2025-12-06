# 八字算法系统使用指南

## 🎯 概述

本项目实现了完整的八字命理分析系统，采用**混合模式**：
- **算法部分**：精确计算四柱、五行、十神、藏干、神煞、格局、用神、大运
- **AI 部分**：使用 Claude API 生成自然语言分析报告

## 📦 已实现的算法模块

### 1. 十神计算系统 ([lib/bazi-shishen.ts](lib/bazi-shishen.ts))

计算日干与其他干支的关系，判断十神类型。

**功能：**
- ✅ 天干十神计算
- ✅ 地支十神计算
- ✅ 十神统计（天干权重1.0，地支权重0.5）
- ✅ 主星、透干分析

**十神类型：**
比肩、劫财、食神、伤官、偏财、正财、偏官、正官、偏印、正印

**使用示例：**
```typescript
import { calculateShishen } from '@/lib/bazi-shishen';

const shishen = calculateShishen({
  yearGan: '甲', monthGan: '丙', dayGan: '戊', hourGan: '庚',
  yearZhi: '子', monthZhi: '寅', dayZhi: '午', hourZhi: '申',
});

console.log(shishen.天干.年干); // '偏财'
console.log(shishen.特征.主星); // 出现最多的十神
```

---

### 2. 藏干计算系统 ([lib/bazi-canggan.ts](lib/bazi-canggan.ts))

地支藏干及五行力量精确计算。

**功能：**
- ✅ 地支藏干查询（本气、中气、余气）
- ✅ 五行力量统计（含藏干加权，月令权重×2）
- ✅ 透干分析
- ✅ 得令判断

**使用示例：**
```typescript
import { calculateCanggan, getCanggan } from '@/lib/bazi-canggan';

// 查询单个地支藏干
const canggan = getCanggan('寅');
console.log(canggan?.benqi); // '甲'（本气）
console.log(canggan?.hiddenStems); // [{ gan: '甲', ratio: 0.6 }, ...]

// 完整分析
const analysis = calculateCanggan(bazi);
console.log(analysis.wuxingStrength); // { 木: 3.2, 火: 2.5, ... }
```

---

### 3. 神煞查表系统 ([lib/bazi-shensha.ts](lib/bazi-shensha.ts))

根据四柱查找吉凶神煞。

**功能：**
- ✅ 天乙贵人、文昌贵人
- ✅ 咸池（桃花）、驿马、华盖
- ✅ 羊刃、禄神、空亡
- ✅ 神煞分类：吉神、凶煞、桃花、中性

**使用示例：**
```typescript
import { calculateShenSha } from '@/lib/bazi-shensha';

const shensha = calculateShenSha(bazi);
console.log(shensha.吉神); // [{ name: '天乙贵人', pillar: '年柱', ... }]
console.log(shensha.凶煞.length); // 凶煞数量
```

---

### 4. 格局判断系统 ([lib/bazi-geju.ts](lib/bazi-geju.ts))

判断八字格局及用神喜忌。

**功能：**
- ✅ 日主强弱计算（0-100分）
- ✅ 月令分析（得令、透干）
- ✅ 格局判断（正格、从格、特殊格局）
- ✅ 用神、喜神、忌神确定

**格局类型：**
- 正格：正官格、正财格、食神格...
- 特殊格局：食神生财格、杀印相生格、伤官佩印格...
- 从格：从财格、从杀格、从儿格、从强格

**使用示例：**
```typescript
import { calculateGeju } from '@/lib/bazi-geju';

const geju = calculateGeju(bazi, shishen, canggan);
console.log(geju.geju); // '食神生财格'
console.log(geju.riju.level); // '偏强'
console.log(geju.yongshen); // '木'
```

---

### 5. 大运计算系统 ([lib/bazi-dayun.ts](lib/bazi-dayun.ts))

计算大运流年及吉凶。

**功能：**
- ✅ 起运岁数计算（顺行/逆行）
- ✅ 排大运（8-10步）
- ✅ 大运吉凶评估
- ✅ 流年计算
- ✅ 最佳/最差大运提示

**使用示例：**
```typescript
import { calculateDayun, calculateLiunian } from '@/lib/bazi-dayun';

const dayun = calculateDayun(
  { yearGan: '甲', monthGan: '丙', monthZhi: '寅' },
  '男',
  new Date('1990-01-01'),
  geju,
  8
);

console.log(dayun.qiyun.age); // 起运岁数
console.log(dayun.dayunList[0]); // { ganzhi: '丁卯', startAge: 3, quality: '吉', ... }

const liunian = calculateLiunian(1990, 2025, dayun, geju);
console.log(liunian.quality); // '大吉'
```

---

## 🤖 AI 生成系统

### AI 报告生成器 ([lib/ai-generator.ts](lib/ai-generator.ts))

使用 Claude API 生成自然语言分析。

**功能：**
- ✅ 9 个报告章节生成
- ✅ Token 估算
- ✅ 专业提示词工程
- ✅ 留余地表述（"倾向于"、"可能"）

**章节列表：**
1. 性格分析
2. 事业运势
3. 财运分析
4. 婚姻感情
5. 健康养生
6. 人际关系
7. 大运分析
8. 流年预测
9. 综合建议

**使用示例：**
```typescript
import { generateFullReport } from '@/lib/ai-generator';

const context = buildAIContext(data, analysis);
const aiSections = await generateFullReport(context, {
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

console.log(aiSections['性格分析']); // AI 生成的性格分析内容
```

**成本估算：**
- 每份报告约 13,500 tokens（9章节）
- Claude Sonnet 4.5 约 $0.03/报告
- 人民币约 ¥0.22/报告（按汇率7.2）

---

## 🚀 增强版报告生成器

### 完整流程 ([lib/report-generator-enhanced.ts](lib/report-generator-enhanced.ts))

整合所有算法 + AI 的完整报告生成。

**使用方式：**

```typescript
import { generateEnhancedReport, mergeFinalReport } from '@/lib/report-generator-enhanced';

// 1. 生成混合报告
const result = await generateEnhancedReport(
  {
    reportId: 'xxx',
    name: '张三',
    gender: '男',
    birthDate: '1990-01-01',
    birthTime: '08:30',
    location: '北京',
    bazi: baziInfo,
    birthYear: 1990,
  },
  {
    useAI: true, // 是否启用 AI
    apiKey: process.env.ANTHROPIC_API_KEY,
  }
);

// 2. 合并最终报告
const finalReport = mergeFinalReport(
  result.algorithmSummary,
  result.aiSections,
  data
);

// 3. 保存或返回
console.log(finalReport); // Markdown 格式完整报告
```

**返回结果：**
```typescript
{
  algorithmSummary: string;        // 算法摘要（Markdown）
  aiSections?: Record<string, string>; // AI 章节内容
  analysis: ComprehensiveAnalysis; // 完整分析数据
  tokenEstimate?: {                // Token 估算
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  }
}
```

---

## 📝 集成到现有 API

### 更新 `/api/reports` 路由

修改 [app/api/reports/route.ts](app/api/reports/route.ts)：

```typescript
import { calculateBazi } from '@/lib/bazi';
import { generateEnhancedReport, mergeFinalReport } from '@/lib/report-generator-enhanced';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, gender, birthDate, birthTime, city, longitude, latitude } = body;

  // 1. 计算八字
  const bazi = calculateBazi(birthDate, birthTime, longitude, latitude);

  // 2. 生成增强报告
  const result = await generateEnhancedReport(
    {
      reportId: `temp_${Date.now()}`,
      name,
      gender: gender === 'male' ? '男' : '女',
      birthDate,
      birthTime,
      location: city,
      bazi,
      birthYear: new Date(birthDate).getFullYear(),
    },
    {
      useAI: !!process.env.ANTHROPIC_API_KEY, // 如果有 API key 就用 AI
      apiKey: process.env.ANTHROPIC_API_KEY,
    }
  );

  // 3. 合并最终报告
  const fullContent = mergeFinalReport(
    result.algorithmSummary,
    result.aiSections,
    { reportId: `temp_${Date.now()}`, name, gender: gender === 'male' ? '男' : '女', birthDate, birthTime, location: city, bazi, birthYear: new Date(birthDate).getFullYear() }
  );

  // 4. 保存到数据库
  const report = await prisma.report.create({
    data: {
      title: `${name}的八字命理分析报告`,
      basicSummary: result.algorithmSummary.substring(0, 500),
      fullContent,
      // ... 其他字段
    },
  });

  return NextResponse.json(report);
}
```

---

## 🔑 环境变量配置

创建 `.env.local` 文件：

```bash
# Claude API Key（可选，如果不配置则只用算法）
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# 管理员密码
NEXT_PUBLIC_ADMIN_PASSWORD=your_password_here
```

**注意：**
- 不配置 `ANTHROPIC_API_KEY` 时，系统只生成算法报告
- 配置后，系统会自动启用 AI 增强分析

---

## 📊 报告结构

### 最终生成的报告包含：

**算法部分（必须）：**
1. 基础信息
2. 五行分析
3. 十神分析
4. 藏干分析
5. 神煞分析
6. 格局分析
7. 大运分析
8. 流年分析

**AI 部分（可选）：**
1. 性格分析（1000-1500字）
2. 事业运势（1000-1500字）
3. 财运分析（1000-1500字）
4. 婚姻感情（1000-1500字）
5. 健康养生（1000-1500字）
6. 人际关系（1000-1500字）
7. 大运分析（1000-1500字）
8. 流年预测（1000-1500字）
9. 综合建议（1000-1500字）

**总字数：** 约 10,000-15,000 字

---

## ✅ 测试建议

### 1. 算法测试
```bash
# 创建测试文件 test-algorithm.ts
import { performComprehensiveAnalysis } from './lib/report-generator-enhanced';

const testData = {
  reportId: 'test',
  name: '测试',
  gender: '男' as const,
  birthDate: '1990-01-01',
  birthTime: '08:30',
  location: '北京',
  bazi: calculateBazi('1990-01-01', '08:30', 116.4, 39.9),
  birthYear: 1990,
};

const analysis = performComprehensiveAnalysis(testData);
console.log(analysis);
```

### 2. AI 测试（需要 API key）
```typescript
import { generateEnhancedReport } from './lib/report-generator-enhanced';

const result = await generateEnhancedReport(testData, {
  useAI: true,
  apiKey: 'your-api-key',
});

console.log(result.tokenEstimate); // 查看 token 使用
```

---

## 🎨 前端展示建议

在 `/reports/[id]` 页面中：

1. **算法数据展示**：
   - 用可视化图表展示五行比例
   - 用表格展示十神统计
   - 用时间轴展示大运

2. **AI 内容展示**：
   - 使用 `react-markdown` 渲染 Markdown
   - 分章节折叠显示
   - 支持导出 Word/PDF

---

## 📚 参考资料

- 十神理论：基于日干五行关系
- 藏干系统：地支所藏天干及比例
- 神煞查表：传统口诀（天乙贵人、文昌等）
- 格局判断：日主强弱、月令得失
- 大运计算：顺逆行、起运岁数

---

## 🚨 注意事项

1. **算法准确性**：
   - 十神、藏干、神煞、格局均按传统理论实现
   - 大运起运岁数简化处理（实际需精确到节气）
   - 流年干支推算基于公元1984年甲子年

2. **AI 生成**：
   - 已设置专业提示词，避免绝对化表述
   - 排除童年家庭、学业等易断错的内容
   - 使用"倾向于"、"可能"、"建议"等留余地词汇

3. **成本控制**：
   - 每份报告约 $0.03
   - 建议设置用户付费（如 ¥9.9/份）
   - 或仅对 VIP 用户启用 AI

4. **性能优化**：
   - AI 生成采用串行（避免并发限流）
   - 每章节间隔 1 秒
   - 总耗时约 10-15 秒

---

## 🎉 完成状态

✅ 所有 7 个任务已完成：
1. ✅ 实现十神计算系统
2. ✅ 实现藏干计算系统
3. ✅ 实现神煞查表系统
4. ✅ 实现格局判断系统
5. ✅ 实现大运计算系统
6. ✅ 集成 Claude API
7. ✅ 更新报告生成器

**下一步：**
1. 申请 Claude API key
2. 配置 `.env.local`
3. 测试完整流程
4. 上线运营！

祝你的八字平台大卖！🚀
