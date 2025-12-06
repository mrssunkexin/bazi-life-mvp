/**
 * 大运计算系统
 * 计算大运流年及吉凶分析
 */

import type { WuxingElement } from './bazi';
import type { GejuAnalysis, YongshenType } from './bazi-geju';

// 大运信息
export interface DayunPeriod {
  ganzhi: string;        // 大运干支
  gan: string;           // 天干
  zhi: string;           // 地支
  startAge: number;      // 起运年龄
  endAge: number;        // 结束年龄
  wuxing: {
    gan: WuxingElement;
    zhi: WuxingElement;
  };
  quality: '大吉' | '吉' | '平' | '凶' | '大凶'; // 吉凶
  description: string;   // 描述
}

// 流年信息
export interface LiunianInfo {
  year: number;          // 公历年份
  ganzhi: string;        // 流年干支
  gan: string;           // 天干
  zhi: string;           // 地支
  age: number;           // 虚岁
  dayun: string;         // 所在大运
  quality: '大吉' | '吉' | '平' | '凶' | '大凶';
  description: string;
}

// 大运分析结果
export interface DayunAnalysis {
  // 起运信息
  qiyun: {
    age: number;         // 起运岁数
    direction: '顺行' | '逆行';
    description: string;
  };

  // 大运列表（通常排8-10步）
  dayunList: DayunPeriod[];

  // 当前大运（如果提供了当前年龄）
  currentDayun?: DayunPeriod;

  // 重要大运
  importantPeriods: {
    best: DayunPeriod[];    // 最好的大运
    worst: DayunPeriod[];   // 最差的大运
  };
}

/**
 * 天干列表
 */
const GAN_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * 地支列表
 */
const ZHI_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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
 * 地支本气五行映射
 */
const ZHI_WUXING: Record<string, WuxingElement> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

/**
 * 计算起运岁数
 * 阳男阴女顺行，阴男阳女逆行
 * 顺行：从生日到下一个节气的天数÷3
 * 逆行：从生日到上一个节气的天数÷3
 */
function calculateQiyunAge(
  gender: '男' | '女',
  yearGan: string,
  birthDate: Date,
  nextJieqi: Date
): { age: number; direction: '顺行' | '逆行' } {
  // 判断年干阴阳
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangGan.includes(yearGan);

  // 判断顺逆
  const isShun = (gender === '男' && isYangYear) || (gender === '女' && !isYangYear);
  const direction = isShun ? '顺行' : '逆行';

  // 计算天数（简化处理，实际应该精确到节气）
  const daysDiff = Math.abs(nextJieqi.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
  const age = Math.floor(daysDiff / 3);

  return { age, direction };
}

/**
 * 获取下一个/上一个干支
 */
function getNextGanzhi(ganzhi: string, forward: boolean): string {
  const gan = ganzhi[0];
  const zhi = ganzhi[1];

  const ganIndex = GAN_LIST.indexOf(gan);
  const zhiIndex = ZHI_LIST.indexOf(zhi);

  if (ganIndex === -1 || zhiIndex === -1) return ganzhi;

  const nextGanIndex = forward
    ? (ganIndex + 1) % 10
    : (ganIndex - 1 + 10) % 10;

  const nextZhiIndex = forward
    ? (zhiIndex + 1) % 12
    : (zhiIndex - 1 + 12) % 12;

  return GAN_LIST[nextGanIndex] + ZHI_LIST[nextZhiIndex];
}

/**
 * 评估大运吉凶
 */
function evaluateDayunQuality(
  dayunGan: string,
  dayunZhi: string,
  geju: GejuAnalysis
): '大吉' | '吉' | '平' | '凶' | '大凶' {
  const ganWuxing = GAN_WUXING[dayunGan];
  const zhiWuxing = ZHI_WUXING[dayunZhi];

  let score = 0;

  // 用神分析
  if (geju.yongshen) {
    if (ganWuxing === geju.yongshen) score += 3;
    if (zhiWuxing === geju.yongshen) score += 2;
  }

  // 喜神分析
  if (geju.xishen.includes(ganWuxing)) score += 2;
  if (geju.xishen.includes(zhiWuxing)) score += 1;

  // 忌神分析
  if (geju.jishen.includes(ganWuxing)) score -= 3;
  if (geju.jishen.includes(zhiWuxing)) score -= 2;

  // 评级
  if (score >= 4) return '大吉';
  if (score >= 2) return '吉';
  if (score >= -1) return '平';
  if (score >= -3) return '凶';
  return '大凶';
}

/**
 * 生成大运描述
 */
function generateDayunDescription(
  ganzhi: string,
  quality: string,
  geju: GejuAnalysis
): string {
  const gan = ganzhi[0];
  const zhi = ganzhi[1];
  const ganWuxing = GAN_WUXING[gan];
  const zhiWuxing = ZHI_WUXING[zhi];

  const parts: string[] = [];

  parts.push(`${ganzhi}运，${ganWuxing}${zhiWuxing}。`);

  if (quality === '大吉' || quality === '吉') {
    if (geju.yongshen && (ganWuxing === geju.yongshen || zhiWuxing === geju.yongshen)) {
      parts.push('用神得力，运势亨通。');
    } else {
      parts.push('运势顺畅，宜积极进取。');
    }
  } else if (quality === '凶' || quality === '大凶') {
    if (geju.jishen.includes(ganWuxing) || geju.jishen.includes(zhiWuxing)) {
      parts.push('忌神当令，宜谨慎保守。');
    } else {
      parts.push('运势欠佳，宜稳健行事。');
    }
  } else {
    parts.push('运势平稳，可守成发展。');
  }

  return parts.join('');
}

/**
 * 计算大运
 */
export function calculateDayun(
  bazi: {
    yearGan: string;
    monthGan: string;
    monthZhi: string;
  },
  gender: '男' | '女',
  birthDate: Date,
  geju: GejuAnalysis,
  stepsCount: number = 8
): DayunAnalysis {
  // 1. 计算起运岁数（简化处理，假设下个节气在30天后）
  const nextJieqi = new Date(birthDate);
  nextJieqi.setDate(nextJieqi.getDate() + 30);

  const qiyun = calculateQiyunAge(gender, bazi.yearGan, birthDate, nextJieqi);

  // 2. 确定大运起点（从月柱开始）
  let currentGanzhi = `${bazi.monthGan}${bazi.monthZhi}`;
  const dayunList: DayunPeriod[] = [];

  // 3. 排大运
  for (let i = 0; i < stepsCount; i++) {
    // 获取下一个大运干支
    currentGanzhi = getNextGanzhi(currentGanzhi, qiyun.direction === '顺行');

    const gan = currentGanzhi[0];
    const zhi = currentGanzhi[1];

    const startAge = qiyun.age + i * 10;
    const endAge = startAge + 9;

    const quality = evaluateDayunQuality(gan, zhi, geju);
    const description = generateDayunDescription(currentGanzhi, quality, geju);

    dayunList.push({
      ganzhi: currentGanzhi,
      gan,
      zhi,
      startAge,
      endAge,
      wuxing: {
        gan: GAN_WUXING[gan],
        zhi: ZHI_WUXING[zhi],
      },
      quality,
      description,
    });
  }

  // 4. 找出重要大运
  const sortedByQuality = [...dayunList].sort((a, b) => {
    const qualityOrder = { '大吉': 5, '吉': 4, '平': 3, '凶': 2, '大凶': 1 };
    return qualityOrder[b.quality] - qualityOrder[a.quality];
  });

  const best = sortedByQuality.filter(d => d.quality === '大吉' || d.quality === '吉').slice(0, 3);
  const worst = sortedByQuality.filter(d => d.quality === '凶' || d.quality === '大凶').slice(0, 3);

  return {
    qiyun: {
      age: qiyun.age,
      direction: qiyun.direction,
      description: `${qiyun.direction}，${qiyun.age}岁起运`,
    },
    dayunList,
    importantPeriods: {
      best,
      worst,
    },
  };
}

/**
 * 获取指定年龄的大运
 */
export function getDayunAtAge(dayunAnalysis: DayunAnalysis, age: number): DayunPeriod | null {
  return dayunAnalysis.dayunList.find(d => age >= d.startAge && age <= d.endAge) || null;
}

/**
 * 计算流年
 * 根据出生年份和当前公历年份计算流年干支
 */
export function calculateLiunian(
  birthYear: number,
  currentYear: number,
  dayunAnalysis: DayunAnalysis,
  geju: GejuAnalysis
): LiunianInfo {
  // 计算虚岁
  const age = currentYear - birthYear + 1;

  // 计算流年干支（简化：使用公元年份推算）
  // 1984年为甲子年，以此为基准
  const baseYear = 1984;
  const yearsSince = currentYear - baseYear;
  const ganIndex = (yearsSince % 10 + 10) % 10;
  const zhiIndex = (yearsSince % 12 + 12) % 12;
  const ganzhi = GAN_LIST[ganIndex] + ZHI_LIST[zhiIndex];

  // 获取当前大运
  const currentDayun = getDayunAtAge(dayunAnalysis, age);
  const dayunGanzhi = currentDayun?.ganzhi || '未知';

  // 评估流年吉凶（结合大运）
  const gan = ganzhi[0];
  const zhi = ganzhi[1];
  const ganWuxing = GAN_WUXING[gan];
  const zhiWuxing = ZHI_WUXING[zhi];

  let score = 0;

  if (geju.yongshen) {
    if (ganWuxing === geju.yongshen) score += 2;
    if (zhiWuxing === geju.yongshen) score += 1;
  }
  if (geju.xishen.includes(ganWuxing)) score += 1;
  if (geju.xishen.includes(zhiWuxing)) score += 1;
  if (geju.jishen.includes(ganWuxing)) score -= 2;
  if (geju.jishen.includes(zhiWuxing)) score -= 1;

  // 大运加成
  if (currentDayun) {
    if (currentDayun.quality === '大吉' || currentDayun.quality === '吉') {
      score += 1;
    } else if (currentDayun.quality === '凶' || currentDayun.quality === '大凶') {
      score -= 1;
    }
  }

  let quality: '大吉' | '吉' | '平' | '凶' | '大凶';
  if (score >= 3) quality = '大吉';
  else if (score >= 1) quality = '吉';
  else if (score >= -1) quality = '平';
  else if (score >= -3) quality = '凶';
  else quality = '大凶';

  const description = `${currentYear}年${ganzhi}，虚岁${age}岁，处于${dayunGanzhi}大运。流年${quality}。`;

  return {
    year: currentYear,
    ganzhi,
    gan,
    zhi,
    age,
    dayun: dayunGanzhi,
    quality,
    description,
  };
}

/**
 * 批量计算流年（未来N年）
 */
export function calculateLiunianRange(
  birthYear: number,
  startYear: number,
  years: number,
  dayunAnalysis: DayunAnalysis,
  geju: GejuAnalysis
): LiunianInfo[] {
  const result: LiunianInfo[] = [];

  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    const liunian = calculateLiunian(birthYear, year, dayunAnalysis, geju);
    result.push(liunian);
  }

  return result;
}

/**
 * 获取大运的详细建议
 */
export function getDayunAdvice(dayun: DayunPeriod, geju: GejuAnalysis): string[] {
  const advice: string[] = [];

  if (dayun.quality === '大吉' || dayun.quality === '吉') {
    advice.push('运势良好，是发展事业的黄金时期');
    advice.push('可以积极进取，把握机会');
    advice.push('适合投资、创业、求学、求职等重大决策');
  } else if (dayun.quality === '凶' || dayun.quality === '大凶') {
    advice.push('运势欠佳，宜谨慎保守');
    advice.push('避免重大投资和冒险决策');
    advice.push('注重养精蓄锐，等待时机');
  } else {
    advice.push('运势平稳，可稳步发展');
    advice.push('守成为主，适度进取');
  }

  return advice;
}
