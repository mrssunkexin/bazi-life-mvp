/**
 * 2026运势报告专用AI生成器
 * 一次性生成完整报告,而非分章节生成
 */

import type { BaziContext, AIGeneratorConfig } from './ai-generator';

export interface Fortune2026Context extends BaziContext {
  year2026: {
    ganzhi: string; // 丙午
    age: number; // 虚岁
    dayun: string; // 所在大运
  };
  solarTerms: SolarTerm[];
}

export interface SolarTerm {
  name: string;
  date: string;
  month: number;
  day: number;
}

/**
 * 2026年24节气时间表(固定数据)
 */
export function get2026SolarTerms(): SolarTerm[] {
  return [
    { name: '立春', date: '2月4日', month: 2, day: 4 },
    { name: '雨水', date: '2月19日', month: 2, day: 19 },
    { name: '惊蛰', date: '3月5日', month: 3, day: 5 },
    { name: '春分', date: '3月20日', month: 3, day: 20 },
    { name: '清明', date: '4月4日', month: 4, day: 4 },
    { name: '谷雨', date: '4月19日', month: 4, day: 19 },
    { name: '立夏', date: '5月5日', month: 5, day: 5 },
    { name: '小满', date: '5月20日', month: 5, day: 20 },
    { name: '芒种', date: '6月5日', month: 6, day: 5 },
    { name: '夏至', date: '6月21日', month: 6, day: 21 },
    { name: '小暑', date: '7月6日', month: 7, day: 6 },
    { name: '大暑', date: '7月22日', month: 7, day: 22 },
    { name: '立秋', date: '8月7日', month: 8, day: 7 },
    { name: '处暑', date: '8月22日', month: 8, day: 22 },
    { name: '白露', date: '9月7日', month: 9, day: 7 },
    { name: '秋分', date: '9月22日', month: 9, day: 22 },
    { name: '寒露', date: '10月8日', month: 10, day: 8 },
    { name: '霜降', date: '10月23日', month: 10, day: 23 },
    { name: '立冬', date: '11月7日', month: 11, day: 7 },
    { name: '小雪', date: '11月22日', month: 11, day: 22 },
    { name: '大雪', date: '12月6日', month: 12, day: 6 },
    { name: '冬至', date: '12月21日', month: 12, day: 21 },
    { name: '小寒', date: '2027年1月5日', month: 1, day: 5 },
    { name: '大寒', date: '2027年1月20日', month: 1, day: 20 },
  ];
}

/**
 * 构建2026专用用户提示词
 */
function build2026UserPrompt(context: Fortune2026Context): string {
  let prompt = `请为以下八字生成【2026年完整流年运势报告】,一次性输出包含8个章节的连贯内容,总字数8000-12000字。

## 基本信息
- 姓名: ${context.name}
- 性别: ${context.gender}
- 出生日期: ${context.birthDate}
- 出生时间: ${context.birthTime}
- 出生地点: ${context.location}

## 四柱八字
- 年柱: ${context.bazi.year}
- 月柱: ${context.bazi.month}
- 日柱: ${context.bazi.day}
- 时柱: ${context.bazi.hour}

## 五行分析
- 木: ${(context.wuxing.木 ?? context.wuxing.wood ?? 0).toFixed(1)}
- 火: ${(context.wuxing.火 ?? context.wuxing.fire ?? 0).toFixed(1)}
- 土: ${(context.wuxing.土 ?? context.wuxing.earth ?? 0).toFixed(1)}
- 金: ${(context.wuxing.金 ?? context.wuxing.metal ?? 0).toFixed(1)}
- 水: ${(context.wuxing.水 ?? context.wuxing.water ?? 0).toFixed(1)}
- 主导五行: ${context.wuxing.dominant ?? context.wuxing.dominant ?? '未知'}
- 缺失五行: ${(context.wuxing.lacking ?? context.wuxing.weak ?? []).join?.('、') || '无'}
`;

  if (context.shishen) {
    prompt += `\n## 十神分析
- 主星: ${context.shishen.主星 || '无'}
- 透干十神: ${(context.shishen.透干 ?? []).join?.('、') || '无'}
- 十神统计: ${Object.entries(context.shishen.统计 ?? {})
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => `${name}${count}个`)
      .join('、') || '无'}
`;
  }

  if (context.geju) {
    prompt += `\n## 格局分析
- 格局: ${context.geju.格局 || '未知'}
- 格局强弱: ${context.geju.强弱 || '未知'}
- 日主强弱: ${context.geju.日主 || '未知'}
- 用神: ${context.geju.用神 || '待定'}
- 喜神: ${(context.geju.喜神 ?? []).join?.('、') || '无'}
- 忌神: ${(context.geju.忌神 ?? []).join?.('、') || '无'}
`;
  }

  prompt += `\n## 2026年(丙午年)信息
- 流年干支: ${context.year2026.ganzhi}
- 虚岁: ${context.year2026.age}岁
- 所在大运: ${context.year2026.dayun}
`;

  prompt += `\n## 2026年24节气时间表\n`;
  const terms = context.solarTerms;
  for (let i = 0; i < terms.length - 2; i += 2) {
    prompt += `${terms[i].name}: ${terms[i].date}  |  ${terms[i + 1].name}: ${terms[i + 1].date}\n`;
  }

  prompt += `\n请严格按照提示词中定义的8个章节结构生成完整报告。务必一次性输出全部章节,内容连贯流畅,总字数8000-12000字。`;

  return prompt;
}

/**
 * 生成2026完整AI报告(一次性生成)
 */
export async function generate2026FullReport(
  context: Fortune2026Context,
  config: AIGeneratorConfig,
  reportId: string
): Promise<string> {
  const startTime = Date.now();

  // 动态导入避免循环依赖
  const { getSystemPrompt2026 } = await import('./prompts');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const logger = await import('./generation-logger');

  const logId = await logger.createGenerationLog(
    reportId,
    'AI生成-2026完整报告' as any,
    'fortune2026'
  );
  await logger.markLogProcessing(logId, 'fortune2026');

  try {
    const systemPrompt = getSystemPrompt2026();
    const userPrompt = build2026UserPrompt(context);

    console.log(`🚀 [2026] 开始生成完整报告 (reportId: ${reportId.substring(0, 8)})...`);
    console.log(`📊 [2026] 预计字数: 8000-12000, Tokens: ~15000`);

    const provider = config.provider || 'deepseek';
    const maxTokens = 8192; // DeepSeek限制最大8192 tokens
    let fullReport = '';

    if (provider === 'deepseek') {
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
      fullReport = data.choices[0].message.content;

    } else if (provider === 'claude') {
      const client = new Anthropic({
        apiKey: config.apiKey,
      });

      const model = config.model || 'claude-sonnet-4-5-20250929';

      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      });

      if (message.content[0].type === 'text') {
        fullReport = message.content[0].text;
      } else {
        throw new Error('Claude API 返回内容格式错误');
      }

    } else if (provider === 'openai') {
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
      fullReport = data.choices[0].message.content;

    } else {
      throw new Error(`不支持的 AI 服务提供商: ${provider}`);
    }

    if (fullReport.length < 5000) {
      throw new Error('AI输出字数过少,可能生成不完整');
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    console.log(`✅ [2026] 报告生成完成 (耗时: ${duration}秒, 字数: ${fullReport.length})`);

    await logger.completeGenerationLog(
      logId,
      { duration, wordCount: fullReport.length },
      'fortune2026'
    );

    return fullReport;

  } catch (error) {
    await logger.failGenerationLog(
      logId,
      error instanceof Error ? error.message : String(error),
      'fortune2026'
    );
    throw error;
  }
}
