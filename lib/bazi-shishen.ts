/**
 * 十神计算系统
 * 基于日干与其他干支的五行关系计算十神
 */

import type { WuxingElement } from './bazi';

// 十神类型
export type ShishenType =
  | '比肩' | '劫财'
  | '食神' | '伤官'
  | '偏财' | '正财'
  | '偏官' | '正官'
  | '偏印' | '正印';

// 十神分析结果
export interface ShishenAnalysis {
  // 天干十神
  天干: {
    年干: ShishenType | null;
    月干: ShishenType | null;
    时干: ShishenType | null;
  };

  // 地支本气十神
  地支: {
    年支: ShishenType | null;
    月支: ShishenType | null;
    日支: ShishenType | null;
    时支: ShishenType | null;
  };

  // 统计
  统计: Record<ShishenType, number>;

  // 主要特征
  特征: {
    主星: ShishenType | null;  // 出现最多的十神
    透干: ShishenType[];  // 透出天干的十神
  };
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
 * 地支本气五行映射
 */
const ZHI_BENQI: Record<string, WuxingElement> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

/**
 * 判断阴阳
 */
function isYang(gan: string): boolean {
  return ['甲', '丙', '戊', '庚', '壬'].includes(gan);
}

/**
 * 五行生克关系
 */
function getWuxingRelation(from: WuxingElement, to: WuxingElement):
  '同' | '生' | '克' | '被生' | '被克' {
  if (from === to) return '同';

  const shengMap: Record<WuxingElement, WuxingElement> = {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木',
  };

  const keMap: Record<WuxingElement, WuxingElement> = {
    '木': '土',
    '火': '金',
    '土': '水',
    '金': '木',
    '水': '火',
  };

  if (shengMap[from] === to) return '生';
  if (keMap[from] === to) return '克';
  if (shengMap[to] === from) return '被生';
  if (keMap[to] === from) return '被克';

  return '同';
}

/**
 * 根据日干和其他干的关系计算十神
 */
export function getShishen(dayGan: string, otherGan: string): ShishenType | null {
  if (!dayGan || !otherGan) return null;

  const dayWuxing = GAN_WUXING[dayGan];
  const otherWuxing = GAN_WUXING[otherGan];

  if (!dayWuxing || !otherWuxing) return null;

  const relation = getWuxingRelation(dayWuxing, otherWuxing);
  const isDayYang = isYang(dayGan);
  const isOtherYang = isYang(otherGan);
  const sameYinYang = isDayYang === isOtherYang;

  switch (relation) {
    case '同':
      return sameYinYang ? '比肩' : '劫财';

    case '生':
      return sameYinYang ? '食神' : '伤官';

    case '克':
      return sameYinYang ? '偏财' : '正财';

    case '被克':
      return sameYinYang ? '偏官' : '正官';

    case '被生':
      return sameYinYang ? '偏印' : '正印';

    default:
      return null;
  }
}

/**
 * 根据日干和地支计算十神
 */
export function getShishenFromZhi(dayGan: string, zhi: string): ShishenType | null {
  const benqi = ZHI_BENQI[zhi];
  if (!benqi) return null;

  // 地支本气对应的天干（取阳干）
  const zhiGanMap: Record<WuxingElement, string> = {
    '木': '甲',
    '火': '丙',
    '土': '戊',
    '金': '庚',
    '水': '壬',
  };

  const zhiGan = zhiGanMap[benqi];
  return getShishen(dayGan, zhiGan);
}

/**
 * 计算完整的十神分析
 */
export function calculateShishen(bazi: {
  yearGan: string;
  monthGan: string;
  dayGan: string;
  hourGan: string;
  yearZhi: string;
  monthZhi: string;
  dayZhi: string;
  hourZhi: string;
}): ShishenAnalysis {
  const dayGan = bazi.dayGan;

  // 计算天干十神
  const tianganShishen = {
    年干: getShishen(dayGan, bazi.yearGan),
    月干: getShishen(dayGan, bazi.monthGan),
    时干: getShishen(dayGan, bazi.hourGan),
  };

  // 计算地支十神
  const dizhiShishen = {
    年支: getShishenFromZhi(dayGan, bazi.yearZhi),
    月支: getShishenFromZhi(dayGan, bazi.monthZhi),
    日支: getShishenFromZhi(dayGan, bazi.dayZhi),
    时支: getShishenFromZhi(dayGan, bazi.hourZhi),
  };

  // 统计十神数量
  const count: Record<ShishenType, number> = {
    '比肩': 0, '劫财': 0,
    '食神': 0, '伤官': 0,
    '偏财': 0, '正财': 0,
    '偏官': 0, '正官': 0,
    '偏印': 0, '正印': 0,
  };

  // 统计天干
  Object.values(tianganShishen).forEach(ss => {
    if (ss) count[ss]++;
  });

  // 统计地支（每个算1个，不用小数）
  Object.values(dizhiShishen).forEach(ss => {
    if (ss) count[ss]++;
  });

  // 找出主星
  let maxCount = 0;
  let mainStar: ShishenType | null = null;
  (Object.entries(count) as [ShishenType, number][]).forEach(([ss, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      mainStar = ss;
    }
  });

  // 找出透干的十神
  const tougan: ShishenType[] = [];
  Object.values(tianganShishen).forEach(ss => {
    if (ss && !tougan.includes(ss)) {
      tougan.push(ss);
    }
  });

  return {
    天干: tianganShishen,
    地支: dizhiShishen,
    统计: count,
    特征: {
      主星: mainStar,
      透干: tougan,
    },
  };
}

/**
 * 获取十神的含义说明
 */
export function getShishenMeaning(shishen: ShishenType): string {
  const meanings: Record<ShishenType, string> = {
    '比肩': '与日主同类，代表兄弟姐妹、朋友、竞争者',
    '劫财': '与日主同类但阴阳不同，代表争夺、竞争',
    '食神': '日主所生，代表才华、表达、子女',
    '伤官': '日主所生但阴阳不同，代表创意、反叛、个性',
    '偏财': '日主所克，代表意外之财、父亲、投资',
    '正财': '日主所克但阴阳不同，代表工资、妻子、稳定收入',
    '偏官': '克制日主，代表压力、挑战、权威',
    '正官': '克制日主但阴阳不同，代表正规权力、职位、约束',
    '偏印': '生日主，代表偏门学问、继母、非正统思维',
    '正印': '生日主但阴阳不同，代表学问、母亲、名誉',
  };

  return meanings[shishen] || '';
}
