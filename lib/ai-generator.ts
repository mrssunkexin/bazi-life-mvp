/**
 * AI 报告生成器
 * 支持多种 AI API: DeepSeek, Claude, OpenAI
 */

import { getSystemPrompt, getSectionPrompt } from './prompts';

// AI 生成配置
export interface AIGeneratorConfig {
  apiKey: string;
  provider?: 'deepseek' | 'claude' | 'openai'; // AI 服务提供商
  model?: string;
  maxTokens?: number;
  baseURL?: string; // API 基础 URL
}

// 报告章节类型
export type ReportSection =
  | '性格分析'
  | '事业运势'
  | '财运分析'
  | '婚姻感情'
  | '健康养生'
  | '人际关系'
  | '大运分析'
  | '流年预测'
  | '综合建议';

// 生成请求
export interface GenerationRequest {
  section: ReportSection;
  context: BaziContext;
  length?: 'short' | 'medium' | 'long'; // 短(500字) | 中(1000字) | 长(2000字)
}

// 八字上下文
export interface BaziContext {
  // 基本信息
  name: string;
  gender: '男' | '女';
  birthDate: string;
  birthTime: string;
  location: string;

  // 四柱八字
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };

  // 五行
  wuxing: {
    木: number;
    火: number;
    土: number;
    金: number;
    水: number;
    dominant: string;
    lacking: string[];
  };

  // 十神
  shishen?: {
    主星: string | null;
    透干: string[];
    统计: Record<string, number>;
  };

  // 格局
  geju?: {
    格局: string;
    强弱: string;
    日主: string;
    用神: string | null;
    喜神: string[];
    忌神: string[];
  };

  // 神煞
  shensha?: {
    吉神: string[];
    凶煞: string[];
    桃花: string[];
  };

  // 大运
  dayun?: {
    当前大运: string;
    年龄段: string;
    吉凶: string;
  };

  // 流年
  liunian?: {
    年份: number;
    干支: string;
    吉凶: string;
  };
}

/**
 * 调用 AI API 生成内容
 */
async function callAI(
  systemPrompt: string,
  userPrompt: string,
  config: AIGeneratorConfig
): Promise<string> {
  const provider = config.provider || 'deepseek';
  const maxTokens = config.maxTokens || 4000;

  if (provider === 'deepseek') {
    // DeepSeek API (OpenAI 兼容格式)
    const model = config.model || 'deepseek-chat';
    const baseURL = config.baseURL || 'https://api.deepseek.com/v1';

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `DeepSeek API 错误 (${response.status}): ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } else if (provider === 'claude') {
    // Claude API (需要 @anthropic-ai/sdk)
    throw new Error('Claude API 暂不可用，请使用 DeepSeek');

  } else if (provider === 'openai') {
    // OpenAI API
    const model = config.model || 'gpt-4o';
    const baseURL = config.baseURL || 'https://api.openai.com/v1';

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API 错误 (${response.status}): ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } else {
    throw new Error(`不支持的 AI 服务提供商: ${provider}`);
  }
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(): string {
  return getSystemPrompt();
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(request: GenerationRequest): string {
  const { section, context, length = 'medium' } = request;

  // 字数要求
  const wordCounts = {
    short: '500-800字',
    medium: '1000-1500字',
    long: '1800-2500字',
  };

  const wordCount = wordCounts[length];

  // 基础信息
  let prompt = `请为以下八字生成【${section}】章节的分析内容，字数要求：${wordCount}。

## 基本信息
- 姓名：${context.name}
- 性别：${context.gender}
- 出生日期：${context.birthDate}
- 出生时间：${context.birthTime}
- 出生地点：${context.location}

## 四柱八字
- 年柱：${context.bazi.year}
- 月柱：${context.bazi.month}
- 日柱：${context.bazi.day}
- 时柱：${context.bazi.hour}

## 五行分析
- 木：${context.wuxing.木.toFixed(1)}
- 火：${context.wuxing.火.toFixed(1)}
- 土：${context.wuxing.土.toFixed(1)}
- 金：${context.wuxing.金.toFixed(1)}
- 水：${context.wuxing.水.toFixed(1)}
- 主导五行：${context.wuxing.dominant}
- 缺失五行：${context.wuxing.lacking.join('、') || '无'}
`;

  // 添加十神信息
  if (context.shishen) {
    prompt += `\n## 十神分析
- 主星：${context.shishen.主星 || '无'}
- 透干十神：${context.shishen.透干.join('、') || '无'}
- 十神统计：${Object.entries(context.shishen.统计)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => `${name}${count}个`)
      .join('、')}
`;
  }

  // 添加格局信息
  if (context.geju) {
    prompt += `\n## 格局分析
- 格局：${context.geju.格局}
- 格局强弱：${context.geju.强弱}
- 日主强弱：${context.geju.日主}
- 用神：${context.geju.用神 || '待定'}
- 喜神：${context.geju.喜神.join('、') || '无'}
- 忌神：${context.geju.忌神.join('、') || '无'}
`;
  }

  // 添加神煞信息
  if (context.shensha) {
    prompt += `\n## 神煞
- 吉神：${context.shensha.吉神.join('、') || '无'}
- 凶煞：${context.shensha.凶煞.join('、') || '无'}
- 桃花：${context.shensha.桃花.join('、') || '无'}
`;
  }

  // 添加大运信息（仅用于大运分析章节）
  if (section === '大运分析' && context.dayun) {
    prompt += `\n## 当前大运
- 大运：${context.dayun.当前大运}
- 年龄段：${context.dayun.年龄段}
- 吉凶：${context.dayun.吉凶}
`;
  }

  // 添加流年信息（仅用于流年预测章节）
  if (section === '流年预测' && context.liunian) {
    prompt += `\n## 流年
- 年份：${context.liunian.年份}
- 干支：${context.liunian.干支}
- 吉凶：${context.liunian.吉凶}
`;
  }

  // 章节特定要求（从配置文件读取）
  const sectionRequirement = getSectionPrompt(section);
  prompt += `\n${sectionRequirement}`;

  return prompt;
}

/**
 * 生成单个章节内容
 */
export async function generateSection(
  request: GenerationRequest,
  config: AIGeneratorConfig
): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(request);

  try {
    const content = await callAI(systemPrompt, userPrompt, config);
    return content;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error(`AI 生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成完整报告（批量生成多个章节）
 */
export async function generateFullReport(
  context: BaziContext,
  config: AIGeneratorConfig,
  sections: ReportSection[] = [
    '性格分析',
    '事业运势',
    '财运分析',
    '婚姻感情',
    '健康养生',
    '人际关系',
    '大运分析',
    '流年预测',
    '综合建议',
  ]
): Promise<Record<ReportSection, string>> {
  const result: Partial<Record<ReportSection, string>> = {};

  // 串行生成（避免并发限流）
  for (const section of sections) {
    console.log(`正在生成章节: ${section}...`);

    const content = await generateSection(
      {
        section,
        context,
        length: 'medium', // 默认中等长度
      },
      config
    );

    result[section] = content;

    // 避免频率限制，间隔1秒
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return result as Record<ReportSection, string>;
}

/**
 * 估算 Token 使用量和成本
 */
export function estimateTokens(
  context: BaziContext,
  sections: ReportSection[],
  provider: 'deepseek' | 'claude' | 'openai' = 'deepseek'
): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // 人民币
  currency: string;
} {
  // 输入 token 估算（每个章节约 1000 tokens）
  const inputTokensPerSection = 1000;
  const inputTokens = sections.length * inputTokensPerSection;

  // 输出 token 估算（中等长度约 1500 tokens）
  const outputTokensPerSection = 1500;
  const outputTokens = sections.length * outputTokensPerSection;

  const totalTokens = inputTokens + outputTokens;

  // 价格估算
  let estimatedCost = 0;
  let currency = '¥';

  if (provider === 'deepseek') {
    // DeepSeek 价格: 输入 ¥0.001/千tokens, 输出 ¥0.002/千tokens
    const inputCost = (inputTokens / 1000) * 0.001;
    const outputCost = (outputTokens / 1000) * 0.002;
    estimatedCost = inputCost + outputCost;
    currency = '¥';
  } else if (provider === 'openai') {
    // OpenAI GPT-4o: $2.50/$10 per million tokens
    const inputCost = (inputTokens / 1_000_000) * 2.5;
    const outputCost = (outputTokens / 1_000_000) * 10;
    estimatedCost = (inputCost + outputCost) * 7.2; // 转换为人民币
    currency = '¥';
  } else if (provider === 'claude') {
    // Claude Sonnet 4.5: $3/$15 per million tokens
    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    estimatedCost = (inputCost + outputCost) * 7.2; // 转换为人民币
    currency = '¥';
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCost,
    currency,
  };
}
