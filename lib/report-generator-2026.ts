/**
 * 2026运势报告生成器
 */

import type { BaziCalculationResult } from './bazi-calculator';
import type { Fortune2026Data } from './fortune-2026';

export interface Report2026Params {
  reportId: string;
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  location: string;
  bazi: BaziCalculationResult;
  fortune2026: Fortune2026Data;
  birthYear: number;
}

/**
 * 生成2026运势报告的Markdown格式内容
 */
export function generate2026Report(params: Report2026Params): string {
  const genderText = params.gender === 'male' ? '男' : '女';

  return `# ${params.name}的2026年流年运势报告

## 基本信息
- 姓名: ${params.name}
- 性别: ${genderText}
- 出生日期: ${params.birthDate}
- 出生时间: ${params.birthTime}
- 出生地点: ${params.location}

## 八字命盘
- 年柱: ${params.bazi.year}
- 月柱: ${params.bazi.month}
- 日柱: ${params.bazi.day}
- 时柱: ${params.bazi.hour}

## 2026年整体运势
${params.fortune2026.yearlyOverview}

## 逐月运势
${params.fortune2026.monthlyFortune}

## 事业运势
${params.fortune2026.careerFortune}

## 财运分析
${params.fortune2026.wealthFortune}

## 健康运势
${params.fortune2026.healthFortune}

## 感情运势
${params.fortune2026.relationshipFortune}

## 幸运元素
- 幸运颜色: ${params.fortune2026.luckyElements.colors.join('、')}
- 幸运方位: ${params.fortune2026.luckyElements.directions.join('、')}
- 幸运数字: ${params.fortune2026.luckyElements.numbers.join('、')}

---
*本报告仅供娱乐参考,不构成专业建议*
`;
}
