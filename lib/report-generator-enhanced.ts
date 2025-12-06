/**
 * 增强版报告生成器
 * 整合所有算法系统 + AI 生成
 */

import type { BaziInfo } from './bazi';
import { calculateShishen } from './bazi-shishen';
import { calculateCanggan } from './bazi-canggan';
import { calculateShenSha, getShenShaSummary } from './bazi-shensha';
import { calculateGeju, getGejuMeaning } from './bazi-geju';
import { calculateDayun, calculateLiunian, getDayunAtAge } from './bazi-dayun';
import type { BaziContext, ReportSection } from './ai-generator';
import { generateFullReport as generateAIReport, estimateTokens } from './ai-generator';

export interface EnhancedReportData {
  // 基本信息
  reportId: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  birthTime: string;
  location: string;

  // 八字信息
  bazi: BaziInfo;

  // 出生年份（用于大运计算）
  birthYear: number;
}

/**
 * 完整的八字分析（算法部分）
 */
export interface ComprehensiveAnalysis {
  // 基础八字
  bazi: BaziInfo;

  // 十神分析
  shishen: ReturnType<typeof calculateShishen>;

  // 藏干分析
  canggan: ReturnType<typeof calculateCanggan>;

  // 神煞分析
  shensha: ReturnType<typeof calculateShenSha>;

  // 格局分析
  geju: ReturnType<typeof calculateGeju>;

  // 大运分析
  dayun: ReturnType<typeof calculateDayun>;

  // 当前流年
  liunian: ReturnType<typeof calculateLiunian>;
}

/**
 * 执行完整的八字分析（纯算法）
 */
export function performComprehensiveAnalysis(
  data: EnhancedReportData
): ComprehensiveAnalysis {
  const { bazi, gender, birthYear } = data;

  // 提取四柱
  const [yearGan, yearZhi] = [bazi.year[0], bazi.year[1]];
  const [monthGan, monthZhi] = [bazi.month[0], bazi.month[1]];
  const [dayGan, dayZhi] = [bazi.day[0], bazi.day[1]];
  const [hourGan, hourZhi] = [bazi.hour[0], bazi.hour[1]];

  const baziGanzhi = {
    yearGan,
    monthGan,
    dayGan,
    hourGan,
    yearZhi,
    monthZhi,
    dayZhi,
    hourZhi,
    year: bazi.year,
    month: bazi.month,
    day: bazi.day,
    hour: bazi.hour,
  };

  // 1. 十神分析
  const shishen = calculateShishen(baziGanzhi);

  // 2. 藏干分析
  const canggan = calculateCanggan(baziGanzhi);

  // 3. 神煞分析
  const shensha = calculateShenSha(baziGanzhi);

  // 4. 格局分析
  const geju = calculateGeju(baziGanzhi, shishen, canggan);

  // 5. 大运分析
  const birthDate = new Date(data.birthDate + 'T' + data.birthTime);
  const dayun = calculateDayun(
    { yearGan, monthGan, monthZhi },
    gender,
    birthDate,
    geju,
    8 // 排8步大运
  );

  // 6. 当前流年
  const currentYear = new Date().getFullYear();
  const liunian = calculateLiunian(birthYear, currentYear, dayun, geju);

  return {
    bazi,
    shishen,
    canggan,
    shensha,
    geju,
    dayun,
    liunian,
  };
}

/**
 * 生成算法摘要报告（纯文本，不使用 AI）
 */
export function generateAlgorithmSummary(analysis: ComprehensiveAnalysis): string {
  const { bazi, shishen, canggan, shensha, geju, dayun, liunian } = analysis;

  const today = new Date().toLocaleDateString('zh-CN');

  return `# 八字命理分析报告（算法版）

## 基础信息
- 生成日期：${today}
- 四柱八字：${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}
${bazi.trueSolarTime ? `- 真太阳时：${bazi.trueSolarTime}\n` : ''}
## 一、五行分析
- 木：${bazi.wuxing.wood}%
- 火：${bazi.wuxing.fire}%
- 土：${bazi.wuxing.earth}%
- 金：${bazi.wuxing.metal}%
- 水：${bazi.wuxing.water}%
- 主导五行：${bazi.wuxing.dominant}
- 弱势五行：${bazi.wuxing.weak}
- 五行特征：${bazi.wuxing.dominant}特征明显

## 二、十神分析
### 天干十神
- 年干：${shishen.天干.年干 || '无'}
- 月干：${shishen.天干.月干 || '无'}
- 时干：${shishen.天干.时干 || '无'}

### 地支十神
- 年支：${shishen.地支.年支 || '无'}
- 月支：${shishen.地支.月支 || '无'}
- 日支：${shishen.地支.日支 || '无'}
- 时支：${shishen.地支.时支 || '无'}

### 十神统计
${Object.entries(shishen.统计)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => `- ${name}：${count}个`)
    .join('\n')}

### 特征
- 主星：${shishen.特征.主星 || '无'}
- 透干：${shishen.特征.透干.join('、') || '无'}

## 三、藏干分析
### 地支藏干
- 年支${canggan.年支.zhi}：本气${canggan.年支.benqi}${canggan.年支.zhongqi ? `、中气${canggan.年支.zhongqi}` : ''}${canggan.年支.yuqi ? `、余气${canggan.年支.yuqi}` : ''}
- 月支${canggan.月支.zhi}：本气${canggan.月支.benqi}${canggan.月支.zhongqi ? `、中气${canggan.月支.zhongqi}` : ''}${canggan.月支.yuqi ? `、余气${canggan.月支.yuqi}` : ''}
- 日支${canggan.日支.zhi}：本气${canggan.日支.benqi}${canggan.日支.zhongqi ? `、中气${canggan.日支.zhongqi}` : ''}${canggan.日支.yuqi ? `、余气${canggan.日支.yuqi}` : ''}
- 时支${canggan.时支.zhi}：本气${canggan.时支.benqi}${canggan.时支.zhongqi ? `、中气${canggan.时支.zhongqi}` : ''}${canggan.时支.yuqi ? `、余气${canggan.时支.yuqi}` : ''}

### 五行力量（含藏干）
${Object.entries(canggan.wuxingStrength)
    .map(([wuxing, strength]) => `- ${wuxing}：${strength.toFixed(1)}`)
    .join('\n')}

### 透干分析
${canggan.透干分析.map(t => `- ${t.gan}透出于：${t.sources.join('、')}`).join('\n')}

## 四、神煞分析
${getShenShaSummary(shensha)}

### 详细列表
${shensha.all.length > 0 ? shensha.all.map(s => `- ${s.name}（${s.pillar} ${s.position}）：${s.description}`).join('\n') : '暂无明显神煞'}

## 五、格局分析
### 格局判定
- 格局类型：${geju.geju}
- 格局强弱：${geju.gejuStrength}
- 格局说明：${getGejuMeaning(geju.geju)}

### 日主分析
- 日主强弱：${geju.riju.level}
- 力量值：${geju.riju.strength}/100
- 说明：${geju.riju.description}

### 月令分析
- 是否得令：${geju.yueling.deling ? '是' : '否'}
- 月令透干：${geju.yueling.tougan ? '是' : '否'}
- 月令本气：${geju.yueling.benqi}
- 说明：${geju.yueling.description}

### 用神体系
- 用神：${geju.yongshen || '待定'}
- 喜神：${geju.xishen.join('、') || '无'}
- 忌神：${geju.jishen.join('、') || '无'}

### 格局描述
${geju.description}

### 建议
${geju.advice.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## 六、大运分析
### 起运信息
- 起运方向：${dayun.qiyun.direction}
- 起运岁数：${dayun.qiyun.age}岁
- 说明：${dayun.qiyun.description}

### 大运列表
${dayun.dayunList.map(d => `- ${d.startAge}-${d.endAge}岁：${d.ganzhi}（${d.quality}）
  ${d.description}`).join('\n')}

### 重要大运
#### 最佳大运
${dayun.importantPeriods.best.map(d => `- ${d.startAge}-${d.endAge}岁：${d.ganzhi}（${d.quality}）`).join('\n')}

#### 需谨慎大运
${dayun.importantPeriods.worst.map(d => `- ${d.startAge}-${d.endAge}岁：${d.ganzhi}（${d.quality}）`).join('\n')}

## 七、流年分析
### ${liunian.year}年（${liunian.ganzhi}）
- 虚岁：${liunian.age}岁
- 所在大运：${liunian.dayun}
- 流年吉凶：${liunian.quality}
- 说明：${liunian.description}

---
*本报告基于传统八字理论，结合算法精确计算，仅供参考。*
`;
}

/**
 * 构建 AI 生成所需的上下文
 */
export function buildAIContext(
  data: EnhancedReportData,
  analysis: ComprehensiveAnalysis
): BaziContext {
  const currentAge = new Date().getFullYear() - data.birthYear + 1;
  const currentDayun = getDayunAtAge(analysis.dayun, currentAge);

  return {
    name: data.name,
    gender: data.gender,
    birthDate: data.birthDate,
    birthTime: data.birthTime,
    location: data.location,

    bazi: {
      year: analysis.bazi.year,
      month: analysis.bazi.month,
      day: analysis.bazi.day,
      hour: analysis.bazi.hour,
    },

    wuxing: {
      木: analysis.canggan.wuxingStrength['木'],
      火: analysis.canggan.wuxingStrength['火'],
      土: analysis.canggan.wuxingStrength['土'],
      金: analysis.canggan.wuxingStrength['金'],
      水: analysis.canggan.wuxingStrength['水'],
      dominant: analysis.bazi.wuxing.dominant,
      lacking: [analysis.bazi.wuxing.weak], // 用 weak 作为 lacking
    },

    shishen: {
      主星: analysis.shishen.特征.主星,
      透干: analysis.shishen.特征.透干,
      统计: analysis.shishen.统计,
    },

    geju: {
      格局: analysis.geju.geju,
      强弱: analysis.geju.gejuStrength,
      日主: analysis.geju.riju.level,
      用神: analysis.geju.yongshen,
      喜神: analysis.geju.xishen,
      忌神: analysis.geju.jishen,
    },

    shensha: {
      吉神: analysis.shensha.吉神.map(s => s.name),
      凶煞: analysis.shensha.凶煞.map(s => s.name),
      桃花: analysis.shensha.桃花.map(s => s.name),
    },

    dayun: currentDayun
      ? {
          当前大运: currentDayun.ganzhi,
          年龄段: `${currentDayun.startAge}-${currentDayun.endAge}岁`,
          吉凶: currentDayun.quality,
        }
      : undefined,

    liunian: {
      年份: analysis.liunian.year,
      干支: analysis.liunian.ganzhi,
      吉凶: analysis.liunian.quality,
    },
  };
}

/**
 * 生成混合模式报告（算法 + AI）
 * @param useAI 是否使用 AI（需要 API key）
 */
export async function generateEnhancedReport(
  data: EnhancedReportData,
  options: {
    useAI?: boolean;
    apiKey?: string;
    provider?: 'deepseek' | 'claude' | 'openai';
    model?: string;
    baseURL?: string;
    sections?: ReportSection[];
  } = {}
): Promise<{
  algorithmSummary: string;
  aiSections?: Record<ReportSection, string>;
  analysis: ComprehensiveAnalysis;
  tokenEstimate?: ReturnType<typeof estimateTokens>;
}> {
  // 1. 执行算法分析（必须）
  const analysis = performComprehensiveAnalysis(data);

  // 2. 生成算法摘要
  const algorithmSummary = generateAlgorithmSummary(analysis);

  // 3. 如果启用 AI，生成 AI 章节
  let aiSections: Record<ReportSection, string> | undefined;
  let tokenEstimate: ReturnType<typeof estimateTokens> | undefined;

  if (options.useAI && options.apiKey) {
    const context = buildAIContext(data, analysis);

    const sections = options.sections || [
      '性格分析',
      '事业运势',
      '财运分析',
      '婚姻感情',
      '健康养生',
      '人际关系',
      '大运分析',
      '流年预测',
      '综合建议',
    ];

    const provider = options.provider || 'deepseek';

    // 估算 token 使用
    tokenEstimate = estimateTokens(context, sections, provider);

    // 生成 AI 内容
    aiSections = await generateAIReport(context, {
      apiKey: options.apiKey,
      provider,
      model: options.model,
      baseURL: options.baseURL,
    }, sections);
  }

  return {
    algorithmSummary,
    aiSections,
    analysis,
    tokenEstimate,
  };
}

/**
 * 合并算法摘要和 AI 章节，生成最终报告
 */
export function mergeFinalReport(
  algorithmSummary: string,
  aiSections: Record<ReportSection, string> | undefined,
  data: EnhancedReportData
): string {
  const today = new Date().toLocaleDateString('zh-CN');

  let report = `# 🌙 ${data.name} 八字命理分析报告

> 报告编号：BXZ-${data.reportId.slice(0, 8)}
> 姓名：${data.name}
> 性别：${data.gender}
> 出生日期：${data.birthDate}
> 出生时间：${data.birthTime}
> 出生地点：${data.location}
> 生成日期：${today}
>
> 本报告基于传统八字命理学，结合现代算法精确计算与AI深度分析。
> 所有命理推算仅供参考，最终由您自己掌握人生方向。

---

`;

  // 添加算法部分
  report += algorithmSummary;
  report += '\n\n---\n\n';

  // 添加 AI 章节
  if (aiSections) {
    report += '# AI 深度分析\n\n';

    const sectionOrder: ReportSection[] = [
      '性格分析',
      '事业运势',
      '财运分析',
      '婚姻感情',
      '健康养生',
      '人际关系',
      '大运分析',
      '流年预测',
      '综合建议',
    ];

    sectionOrder.forEach((section, index) => {
      if (aiSections[section]) {
        report += `## 第${index + 1}章：${section}\n\n`;
        report += aiSections[section];
        report += '\n\n---\n\n';
      }
    });
  } else {
    report += '\n\n*AI 深度分析未启用。如需更详细的人生建议，请联系管理员启用 AI 分析功能。*\n\n';
  }

  report += `
> **免责声明**
>
> 本报告内容基于传统命理理论，旨在提供自我认知与人生参考。
> 任何预测和建议均不构成绝对判断，人生由您自己创造。
> 遇到重要决策时，请结合实际情况理性判断。
`;

  return report;
}
