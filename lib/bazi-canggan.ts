/**
 * 藏干计算系统
 * 地支藏干及其力量计算
 */

import type { WuxingElement } from './bazi';

// 藏干信息
export interface HiddenStem {
  gan: string;          // 天干
  ratio: number;        // 力量占比
  wuxing: WuxingElement; // 五行属性
}

// 地支藏干结果
export interface CangganResult {
  zhi: string;
  hiddenStems: HiddenStem[];
  benqi: string;        // 本气（主气）
  zhongqi: string | null; // 中气
  yuqi: string | null;   // 余气
}

// 完整藏干分析
export interface CangganAnalysis {
  年支: CangganResult;
  月支: CangganResult;
  日支: CangganResult;
  时支: CangganResult;

  // 五行力量统计（考虑藏干）
  wuxingStrength: Record<WuxingElement, number>;

  // 天干透出情况
  透干分析: {
    gan: string;
    sources: string[]; // 从哪些地支透出
  }[];
}

/**
 * 天干五行映射
 */
const GAN_WUXING: Record<string, WuxingElement> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/**
 * 地支藏干对照表
 * 按照传统命理学，每个地支包含1-3个天干
 * 格式：[本气, 中气?, 余气?]，附带力量占比
 */
const ZHI_CANGGAN_MAP: Record<string, HiddenStem[]> = {
  // 子（冬至）：纯水
  '子': [
    { gan: '癸', ratio: 1.0, wuxing: '水' }
  ],

  // 丑（小寒、大寒）：土为主，含水金
  '丑': [
    { gan: '己', ratio: 0.6, wuxing: '土' },
    { gan: '癸', ratio: 0.3, wuxing: '水' },
    { gan: '辛', ratio: 0.1, wuxing: '金' }
  ],

  // 寅（立春、雨水）：木为主，含火土
  '寅': [
    { gan: '甲', ratio: 0.6, wuxing: '木' },
    { gan: '丙', ratio: 0.3, wuxing: '火' },
    { gan: '戊', ratio: 0.1, wuxing: '土' }
  ],

  // 卯（春分）：纯木
  '卯': [
    { gan: '乙', ratio: 1.0, wuxing: '木' }
  ],

  // 辰（清明、谷雨）：土为主，含木水
  '辰': [
    { gan: '戊', ratio: 0.6, wuxing: '土' },
    { gan: '乙', ratio: 0.3, wuxing: '木' },
    { gan: '癸', ratio: 0.1, wuxing: '水' }
  ],

  // 巳（立夏、小满）：火为主，含土金
  '巳': [
    { gan: '丙', ratio: 0.6, wuxing: '火' },
    { gan: '戊', ratio: 0.3, wuxing: '土' },
    { gan: '庚', ratio: 0.1, wuxing: '金' }
  ],

  // 午（夏至）：纯火
  '午': [
    { gan: '丁', ratio: 0.7, wuxing: '火' },
    { gan: '己', ratio: 0.3, wuxing: '土' }
  ],

  // 未（小暑、大暑）：土为主，含火木
  '未': [
    { gan: '己', ratio: 0.6, wuxing: '土' },
    { gan: '丁', ratio: 0.3, wuxing: '火' },
    { gan: '乙', ratio: 0.1, wuxing: '木' }
  ],

  // 申（立秋、处暑）：金为主，含水土
  '申': [
    { gan: '庚', ratio: 0.6, wuxing: '金' },
    { gan: '壬', ratio: 0.3, wuxing: '水' },
    { gan: '戊', ratio: 0.1, wuxing: '土' }
  ],

  // 酉（秋分）：纯金
  '酉': [
    { gan: '辛', ratio: 1.0, wuxing: '金' }
  ],

  // 戌（寒露、霜降）：土为主，含火金
  '戌': [
    { gan: '戊', ratio: 0.6, wuxing: '土' },
    { gan: '辛', ratio: 0.3, wuxing: '金' },
    { gan: '丁', ratio: 0.1, wuxing: '火' }
  ],

  // 亥（立冬、小雪）：水为主，含木
  '亥': [
    { gan: '壬', ratio: 0.7, wuxing: '水' },
    { gan: '甲', ratio: 0.3, wuxing: '木' }
  ],
};

/**
 * 获取单个地支的藏干
 */
export function getCanggan(zhi: string): CangganResult | null {
  const hiddenStems = ZHI_CANGGAN_MAP[zhi];
  if (!hiddenStems) return null;

  return {
    zhi,
    hiddenStems,
    benqi: hiddenStems[0].gan,
    zhongqi: hiddenStems[1]?.gan || null,
    yuqi: hiddenStems[2]?.gan || null,
  };
}

/**
 * 检查天干是否从地支透出
 * @param gan 天干
 * @param zhi 地支
 * @returns 是否透出
 */
export function isTougan(gan: string, zhi: string): boolean {
  const canggan = getCanggan(zhi);
  if (!canggan) return false;

  return canggan.hiddenStems.some(hs => hs.gan === gan);
}

/**
 * 计算完整的藏干分析
 */
export function calculateCanggan(bazi: {
  yearGan: string;
  monthGan: string;
  dayGan: string;
  hourGan: string;
  yearZhi: string;
  monthZhi: string;
  dayZhi: string;
  hourZhi: string;
}): CangganAnalysis {
  // 获取各地支藏干
  const yearCanggan = getCanggan(bazi.yearZhi);
  const monthCanggan = getCanggan(bazi.monthZhi);
  const dayCanggan = getCanggan(bazi.dayZhi);
  const hourCanggan = getCanggan(bazi.hourZhi);

  // 默认空结果
  const emptyResult: CangganResult = {
    zhi: '',
    hiddenStems: [],
    benqi: '',
    zhongqi: null,
    yuqi: null,
  };

  // 计算五行力量（天干 + 地支藏干）
  const wuxingStrength: Record<WuxingElement, number> = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0,
  };

  // 天干力量（每个算1.0）
  const ganList = [bazi.yearGan, bazi.monthGan, bazi.dayGan, bazi.hourGan];
  ganList.forEach(gan => {
    const wuxing = GAN_WUXING[gan];
    if (wuxing) {
      wuxingStrength[wuxing] += 1.0;
    }
  });

  // 地支藏干力量（按比例计算，月支权重加倍）
  const zhiList = [
    { zhi: bazi.yearZhi, canggan: yearCanggan, weight: 1.0 },
    { zhi: bazi.monthZhi, canggan: monthCanggan, weight: 2.0 }, // 月令最重要
    { zhi: bazi.dayZhi, canggan: dayCanggan, weight: 1.0 },
    { zhi: bazi.hourZhi, canggan: hourCanggan, weight: 1.0 },
  ];

  zhiList.forEach(({ canggan, weight }) => {
    if (canggan) {
      canggan.hiddenStems.forEach(hs => {
        wuxingStrength[hs.wuxing] += hs.ratio * weight;
      });
    }
  });

  // 分析透干情况
  const touganAnalysis: { gan: string; sources: string[] }[] = [];

  ganList.forEach(gan => {
    const sources: string[] = [];

    if (yearCanggan && isTougan(gan, bazi.yearZhi)) sources.push('年支');
    if (monthCanggan && isTougan(gan, bazi.monthZhi)) sources.push('月支');
    if (dayCanggan && isTougan(gan, bazi.dayZhi)) sources.push('日支');
    if (hourCanggan && isTougan(gan, bazi.hourZhi)) sources.push('时支');

    if (sources.length > 0) {
      touganAnalysis.push({ gan, sources });
    }
  });

  return {
    年支: yearCanggan || emptyResult,
    月支: monthCanggan || emptyResult,
    日支: dayCanggan || emptyResult,
    时支: hourCanggan || emptyResult,
    wuxingStrength,
    透干分析: touganAnalysis,
  };
}

/**
 * 获取藏干的文字说明
 */
export function getCangganDescription(result: CangganResult): string {
  const parts = result.hiddenStems.map(hs =>
    `${hs.gan}(${Math.round(hs.ratio * 100)}%)`
  );
  return `${result.zhi}藏：${parts.join('、')}`;
}

/**
 * 判断是否得令（月支本气是否与日干五行相生或相同）
 */
export function isDeling(dayGan: string, monthZhi: string): boolean {
  const monthCanggan = getCanggan(monthZhi);
  if (!monthCanggan) return false;

  const dayWuxing = GAN_WUXING[dayGan];
  const monthBenqiWuxing = GAN_WUXING[monthCanggan.benqi];

  if (!dayWuxing || !monthBenqiWuxing) return false;

  // 同五行为得令
  if (dayWuxing === monthBenqiWuxing) return true;

  // 月令生日干为得令
  const shengMap: Record<WuxingElement, WuxingElement> = {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木',
  };

  return shengMap[monthBenqiWuxing] === dayWuxing;
}
