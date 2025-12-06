/**
 * 八字计算工具
 * 使用 lunar-javascript 库
 */

import { Lunar, Solar } from 'lunar-javascript';

// 五行元素
export type WuxingElement = '木' | '火' | '土' | '金' | '水';

// 五行分析结果
export interface WuxingAnalysis {
  wood: number;   // 木 %
  fire: number;   // 火 %
  earth: number;  // 土 %
  metal: number;  // 金 %
  water: number;  // 水 %
  dominant: WuxingElement;  // 主导元素
  weak: WuxingElement;      // 弱势元素
}

// 八字信息
export interface BaziInfo {
  year: string;     // 年柱（干支）
  month: string;    // 月柱
  day: string;      // 日柱
  hour: string;     // 时柱
  yearGan: string;  // 年干
  yearZhi: string;  // 年支
  monthGan: string; // 月干
  monthZhi: string; // 月支
  dayGan: string;   // 日干
  dayZhi: string;   // 日支
  hourGan: string;  // 时干
  hourZhi: string;  // 时支
  naYin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  wuxing: WuxingAnalysis;
  trueSolarTime?: string; // 真太阳时（如果有经纬度）
}

/**
 * 天干对应五行
 */
const GAN_WUXING: Record<string, WuxingElement> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/**
 * 地支对应五行
 */
const ZHI_WUXING: Record<string, WuxingElement> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

/**
 * 计算八字
 * @param birthDate 出生日期 YYYY-MM-DD
 * @param birthTime 出生时间 HH:mm
 * @param longitude 经度（可选，用于真太阳时计算）
 * @param latitude 纬度（可选）
 */
export function calculateBazi(
  birthDate: string,
  birthTime: string,
  longitude?: number,
  latitude?: number
): BaziInfo {
  // 解析日期时间
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  // 创建阳历对象
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);

  // 转换为农历
  const lunar = solar.getLunar();

  // 获取八字
  const eightChar = lunar.getEightChar();

  // 年柱
  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const yearPillar = yearGan + yearZhi;

  // 月柱
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const monthPillar = monthGan + monthZhi;

  // 日柱
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const dayPillar = dayGan + dayZhi;

  // 时柱
  const hourGan = eightChar.getTimeGan();
  const hourZhi = eightChar.getTimeZhi();
  const hourPillar = hourGan + hourZhi;

  // 纳音
  const naYin = {
    year: eightChar.getYearNaYin(),
    month: eightChar.getMonthNaYin(),
    day: eightChar.getDayNaYin(),
    hour: eightChar.getTimeNaYin(),
  };

  // 计算五行分析
  const wuxing = analyzeWuxing([
    yearGan, yearZhi,
    monthGan, monthZhi,
    dayGan, dayZhi,
    hourGan, hourZhi,
  ]);

  // 真太阳时计算（如果提供了经度）
  let trueSolarTime: string | undefined;
  if (longitude !== undefined) {
    // lunar-javascript 的真太阳时计算
    // 经度每15度差1小时，东经为正
    const timeOffset = (longitude - 120) / 15; // 120是东八区标准经度
    const solarMinutes = Math.round(timeOffset * 60);

    let trueHour = hour;
    let trueMinute = minute + solarMinutes;

    if (trueMinute >= 60) {
      trueHour += Math.floor(trueMinute / 60);
      trueMinute = trueMinute % 60;
    } else if (trueMinute < 0) {
      trueHour -= Math.ceil(Math.abs(trueMinute) / 60);
      trueMinute = 60 + (trueMinute % 60);
    }

    if (trueHour >= 24) trueHour -= 24;
    if (trueHour < 0) trueHour += 24;

    trueSolarTime = `${String(trueHour).padStart(2, '0')}:${String(trueMinute).padStart(2, '0')}`;
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    yearGan,
    yearZhi,
    monthGan,
    monthZhi,
    dayGan,
    dayZhi,
    hourGan,
    hourZhi,
    naYin,
    wuxing,
    trueSolarTime,
  };
}

/**
 * 分析五行
 */
function analyzeWuxing(elements: string[]): WuxingAnalysis {
  const counts: Record<WuxingElement, number> = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0,
  };

  // 统计每个元素
  elements.forEach(char => {
    const wuxing = GAN_WUXING[char] || ZHI_WUXING[char];
    if (wuxing) {
      counts[wuxing]++;
    }
  });

  // 计算百分比
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const percentages = {
    wood: Math.round((counts['木'] / total) * 100),
    fire: Math.round((counts['火'] / total) * 100),
    earth: Math.round((counts['土'] / total) * 100),
    metal: Math.round((counts['金'] / total) * 100),
    water: Math.round((counts['水'] / total) * 100),
  };

  // 找出主导和弱势元素
  const entries = Object.entries(counts) as [WuxingElement, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const dominant = entries[0][0];
  const weak = entries[entries.length - 1][0];

  return {
    ...percentages,
    dominant,
    weak,
  };
}

/**
 * 获取五行象征意义
 */
export function getWuxingSymbolism(element: WuxingElement): string {
  const symbolism: Record<WuxingElement, string> = {
    '木': '生长、创造、仁慈',
    '火': '热情、光明、礼仪',
    '土': '稳重、包容、信用',
    '金': '刚毅、果断、义气',
    '水': '智慧、灵活、机变',
  };
  return symbolism[element];
}

/**
 * 获取五行薄弱领域
 */
export function getWuxingWeakArea(element: WuxingElement): string {
  const weakAreas: Record<WuxingElement, string> = {
    '木': '决断力与执行力',
    '火': '热情与表达力',
    '土': '稳定性与包容心',
    '金': '原则性与果断',
    '水': '灵活性与智慧',
  };
  return weakAreas[element];
}

/**
 * 获取平衡建议
 */
export function getBalanceAction(element: WuxingElement): string {
  const actions: Record<WuxingElement, string> = {
    '木': '多接触自然、培养创造力',
    '火': '增加社交活动、学习表达',
    '土': '培养耐心、建立稳定习惯',
    '金': '锻炼决断力、坚持原则',
    '水': '多思考学习、保持灵活',
  };
  return actions[element];
}
