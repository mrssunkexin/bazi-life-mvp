/**
 * 格局判断系统
 * 根据八字判断格局类型和用神喜忌
 */

import type { WuxingElement } from './bazi';
import type { ShishenAnalysis, ShishenType } from './bazi-shishen';
import type { CangganAnalysis } from './bazi-canggan';

// 格局类型
export type GejuType =
  // 正格（普通格局）
  | '正官格' | '偏官格（七杀格）'
  | '正财格' | '偏财格'
  | '正印格' | '偏印格（枭神格）'
  | '食神格' | '伤官格'
  | '比劫格'
  // 特殊格局
  | '食神生财格' | '伤官佩印格' | '杀印相生格'
  | '财官双美格' | '官印相生格'
  // 从格
  | '从财格' | '从杀格' | '从儿格' | '从强格'
  // 化格
  | '化气格'
  // 其他
  | '普通格局';

// 用神类型
export type YongshenType = WuxingElement;

// 格局分析结果
export interface GejuAnalysis {
  // 格局
  geju: GejuType;
  gejuStrength: '强' | '中' | '弱'; // 格局强弱

  // 用神体系
  yongshen: YongshenType | null;    // 用神（最重要）
  xishen: YongshenType[];            // 喜神
  jishen: YongshenType[];            // 忌神

  // 日主强弱
  riju: {
    strength: number;      // 力量值（0-100）
    level: '极强' | '偏强' | '中和' | '偏弱' | '极弱';
    description: string;
  };

  // 月令分析
  yueling: {
    deling: boolean;       // 是否得令
    tougan: boolean;       // 月令是否透干
    benqi: string;         // 月令本气
    description: string;
  };

  // 格局说明
  description: string;
  advice: string[];        // 建议
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
 * 五行相生关系
 */
const SHENG_MAP: Record<WuxingElement, WuxingElement> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
};

/**
 * 五行相克关系
 */
const KE_MAP: Record<WuxingElement, WuxingElement> = {
  '木': '土',
  '火': '金',
  '土': '水',
  '金': '木',
  '水': '火',
};

/**
 * 计算日主强弱
 */
function calculateRijuStrength(
  bazi: { dayGan: string; monthZhi: string },
  canggan: CangganAnalysis,
  shishen: ShishenAnalysis
): { strength: number; level: '极强' | '偏强' | '中和' | '偏弱' | '极弱' } {
  const dayWuxing = GAN_WUXING[bazi.dayGan];

  // 基础力量：日主自身 = 10分
  let strength = 10;

  // 月令得失（最重要，占50%）
  const monthBenqi = canggan.月支.benqi;
  const monthWuxing = GAN_WUXING[monthBenqi];

  if (monthWuxing === dayWuxing) {
    strength += 50; // 月令同类，得令
  } else if (SHENG_MAP[monthWuxing] === dayWuxing) {
    strength += 30; // 月令生日主
  } else if (KE_MAP[monthWuxing] === dayWuxing) {
    strength -= 30; // 月令克日主
  } else if (SHENG_MAP[dayWuxing] === monthWuxing) {
    strength -= 20; // 日主生月令，泄气
  } else if (KE_MAP[dayWuxing] === monthWuxing) {
    strength += 10; // 日主克月令，有力
  }

  // 五行力量（占30%）
  const wuxingStr = canggan.wuxingStrength[dayWuxing];
  const totalWuxing = Object.values(canggan.wuxingStrength).reduce((a, b) => a + b, 0);
  const wuxingRatio = wuxingStr / totalWuxing;

  if (wuxingRatio > 0.4) {
    strength += 30;
  } else if (wuxingRatio > 0.3) {
    strength += 20;
  } else if (wuxingRatio > 0.2) {
    strength += 10;
  } else if (wuxingRatio < 0.1) {
    strength -= 20;
  }

  // 比劫帮身（占20%）
  const bijieCount = shishen.统计['比肩'] + shishen.统计['劫财'];
  if (bijieCount >= 3) {
    strength += 20;
  } else if (bijieCount >= 2) {
    strength += 10;
  }

  // 印星生身
  const yinxingCount = shishen.统计['正印'] + shishen.统计['偏印'];
  if (yinxingCount >= 2) {
    strength += 15;
  } else if (yinxingCount >= 1) {
    strength += 8;
  }

  // 限制在0-100
  strength = Math.max(0, Math.min(100, strength));

  // 判断强弱等级
  let level: '极强' | '偏强' | '中和' | '偏弱' | '极弱';
  if (strength >= 75) level = '极强';
  else if (strength >= 55) level = '偏强';
  else if (strength >= 45) level = '中和';
  else if (strength >= 25) level = '偏弱';
  else level = '极弱';

  return { strength, level };
}

/**
 * 分析月令
 */
function analyzeYueling(
  bazi: { dayGan: string; monthGan: string; monthZhi: string },
  canggan: CangganAnalysis
): {
  deling: boolean;
  tougan: boolean;
  benqi: string;
  description: string;
} {
  const dayWuxing = GAN_WUXING[bazi.dayGan];
  const monthBenqi = canggan.月支.benqi;
  const monthWuxing = GAN_WUXING[monthBenqi];

  // 判断得令
  const deling = monthWuxing === dayWuxing || SHENG_MAP[monthWuxing] === dayWuxing;

  // 判断月令是否透干
  const tougan = canggan.透干分析.some(
    t => t.gan === monthBenqi && t.sources.includes('月支')
  );

  let description = '';
  if (deling) {
    description = tougan
      ? '月令得力且透干，格局有力'
      : '月令得力但未透干，格局稍弱';
  } else {
    description = tougan
      ? '月令失令但透干，尚可取用'
      : '月令失令且未透干，格局较弱';
  }

  return {
    deling,
    tougan,
    benqi: monthBenqi,
    description,
  };
}

/**
 * 判断格局类型
 */
function determineGeju(
  bazi: { dayGan: string; monthGan: string; monthZhi: string },
  shishen: ShishenAnalysis,
  canggan: CangganAnalysis,
  rijuStrength: { strength: number; level: string }
): GejuType {
  const monthBenqi = canggan.月支.benqi;
  const monthShishen = shishen.地支.月支;

  // 1. 从格判断（日主极弱）
  if (rijuStrength.strength < 20) {
    const caiCount = shishen.统计['正财'] + shishen.统计['偏财'];
    const shaCount = shishen.统计['正官'] + shishen.统计['偏官'];
    const shiCount = shishen.统计['食神'] + shishen.统计['伤官'];

    if (caiCount >= 3) return '从财格';
    if (shaCount >= 3) return '从杀格';
    if (shiCount >= 3) return '从儿格';
  }

  // 2. 从强格判断（日主极强）
  if (rijuStrength.strength > 80) {
    const bijieCount = shishen.统计['比肩'] + shishen.统计['劫财'];
    if (bijieCount >= 3) return '从强格';
  }

  // 3. 正格判断（以月令为主）
  if (monthShishen) {
    // 检查是否为组合格局
    const caiCount = shishen.统计['正财'] + shishen.统计['偏财'];
    const guanCount = shishen.统计['正官'] + shishen.统计['偏官'];
    const yinCount = shishen.统计['正印'] + shishen.统计['偏印'];
    const shiCount = shishen.统计['食神'] + shishen.统计['伤官'];

    // 食神生财格
    if (monthShishen === '食神' && caiCount >= 1) {
      return '食神生财格';
    }

    // 伤官佩印格
    if (monthShishen === '伤官' && yinCount >= 1) {
      return '伤官佩印格';
    }

    // 杀印相生格
    if (monthShishen === '偏官' && yinCount >= 1) {
      return '杀印相生格';
    }

    // 官印相生格
    if (monthShishen === '正官' && yinCount >= 1) {
      return '官印相生格';
    }

    // 财官双美格
    if ((monthShishen === '正财' || monthShishen === '偏财') && guanCount >= 1) {
      return '财官双美格';
    }

    // 单一格局
    switch (monthShishen) {
      case '正官': return '正官格';
      case '偏官': return '偏官格（七杀格）';
      case '正财': return '正财格';
      case '偏财': return '偏财格';
      case '正印': return '正印格';
      case '偏印': return '偏印格（枭神格）';
      case '食神': return '食神格';
      case '伤官': return '伤官格';
      case '比肩':
      case '劫财': return '比劫格';
    }
  }

  return '普通格局';
}

/**
 * 确定用神喜忌
 */
function determineYongshen(
  bazi: { dayGan: string },
  geju: GejuType,
  rijuStrength: { strength: number; level: string },
  canggan: CangganAnalysis
): {
  yongshen: YongshenType | null;
  xishen: YongshenType[];
  jishen: YongshenType[];
} {
  const dayWuxing = GAN_WUXING[bazi.dayGan];
  let yongshen: YongshenType | null = null;
  const xishen: YongshenType[] = [];
  const jishen: YongshenType[] = [];

  // 从格特殊处理
  if (geju === '从财格') {
    // 顺从财星，财为用神
    yongshen = KE_MAP[dayWuxing]; // 日主所克为财
    xishen.push(SHENG_MAP[yongshen]); // 生财
    jishen.push(dayWuxing); // 比劫为忌
    const yinWuxing = Object.entries(SHENG_MAP).find(([_, v]) => v === dayWuxing)?.[0] as WuxingElement;
    if (yinWuxing) jishen.push(yinWuxing); // 印为忌
  } else if (geju === '从杀格') {
    // 顺从官杀，杀为用神
    yongshen = KE_MAP[Object.entries(KE_MAP).find(([_, v]) => v === dayWuxing)?.[0] as WuxingElement] || '金';
    const shiWuxing = SHENG_MAP[dayWuxing]; // 食伤为喜（制杀）
    xishen.push(shiWuxing);
  } else if (geju === '从强格') {
    // 顺从比劫，比劫为用神
    yongshen = dayWuxing;
    xishen.push(SHENG_MAP[dayWuxing]); // 食伤为喜
    jishen.push(KE_MAP[Object.entries(KE_MAP).find(([_, v]) => v === dayWuxing)?.[0] as WuxingElement] || '土'); // 官杀为忌
  } else {
    // 普通格局：扶抑法
    if (rijuStrength.level === '偏强' || rijuStrength.level === '极强') {
      // 身强：取克泄耗为用
      // 优先食伤泄秀
      yongshen = SHENG_MAP[dayWuxing];
      xishen.push(KE_MAP[dayWuxing]); // 财
      xishen.push(KE_MAP[Object.entries(KE_MAP).find(([_, v]) => v === dayWuxing)?.[0] as WuxingElement] || '土'); // 官杀

      // 忌比劫、印星
      jishen.push(dayWuxing);
      const yinWuxing = Object.entries(SHENG_MAP).find(([_, v]) => v === dayWuxing)?.[0] as WuxingElement;
      if (yinWuxing) jishen.push(yinWuxing);
    } else if (rijuStrength.level === '偏弱' || rijuStrength.level === '极弱') {
      // 身弱：取生扶为用
      // 优先印星
      const yinWuxing = Object.entries(SHENG_MAP).find(([_, v]) => v === dayWuxing)?.[0] as WuxingElement;
      if (yinWuxing) {
        yongshen = yinWuxing;
        xishen.push(dayWuxing); // 比劫
      }

      // 忌官杀、食伤、财
      jishen.push(SHENG_MAP[dayWuxing]); // 食伤
      jishen.push(KE_MAP[dayWuxing]); // 财
    } else {
      // 中和：根据格局特点取用
      // 这里简化处理，实际需要更复杂的逻辑
      yongshen = SHENG_MAP[dayWuxing];
    }
  }

  return { yongshen, xishen, jishen };
}

/**
 * 计算完整的格局分析
 */
export function calculateGeju(
  bazi: {
    yearGan: string;
    monthGan: string;
    dayGan: string;
    hourGan: string;
    yearZhi: string;
    monthZhi: string;
    dayZhi: string;
    hourZhi: string;
  },
  shishen: ShishenAnalysis,
  canggan: CangganAnalysis
): GejuAnalysis {
  // 1. 计算日主强弱
  const rijuStrength = calculateRijuStrength(bazi, canggan, shishen);

  // 2. 分析月令
  const yueling = analyzeYueling(bazi, canggan);

  // 3. 判断格局
  const geju = determineGeju(bazi, shishen, canggan, rijuStrength);

  // 4. 确定用神喜忌
  const { yongshen, xishen, jishen } = determineYongshen(bazi, geju, rijuStrength, canggan);

  // 5. 判断格局强弱
  let gejuStrength: '强' | '中' | '弱';
  if (yueling.deling && yueling.tougan) {
    gejuStrength = '强';
  } else if (yueling.deling || yueling.tougan) {
    gejuStrength = '中';
  } else {
    gejuStrength = '弱';
  }

  // 6. 生成描述和建议
  const description = generateGejuDescription(geju, rijuStrength, yueling, gejuStrength);
  const advice = generateAdvice(geju, yongshen, xishen, jishen);

  return {
    geju,
    gejuStrength,
    yongshen,
    xishen,
    jishen,
    riju: {
      strength: rijuStrength.strength,
      level: rijuStrength.level,
      description: `日主${rijuStrength.level}（力量${rijuStrength.strength}/100）`,
    },
    yueling: {
      ...yueling,
    },
    description,
    advice,
  };
}

/**
 * 生成格局描述
 */
function generateGejuDescription(
  geju: GejuType,
  riju: { level: string },
  yueling: { deling: boolean; tougan: boolean; description: string },
  strength: '强' | '中' | '弱'
): string {
  const parts = [
    `命局为${geju}，格局${strength === '强' ? '有力' : strength === '中' ? '尚可' : '较弱'}。`,
    `日主${riju.level}。`,
    yueling.description,
  ];

  return parts.join(' ');
}

/**
 * 生成建议
 */
function generateAdvice(
  geju: GejuType,
  yongshen: YongshenType | null,
  xishen: YongshenType[],
  jishen: YongshenType[]
): string[] {
  const advice: string[] = [];

  if (yongshen) {
    advice.push(`用神为${yongshen}，宜从事与${yongshen}相关的行业`);
  }

  if (xishen.length > 0) {
    advice.push(`喜神为${xishen.join('、')}，可作为辅助发展方向`);
  }

  if (jishen.length > 0) {
    advice.push(`忌神为${jishen.join('、')}，应避免相关五行过旺`);
  }

  // 根据格局给出具体建议
  switch (geju) {
    case '食神生财格':
      advice.push('适合创意、技术、商业等领域，以才华创造财富');
      break;
    case '杀印相生格':
      advice.push('适合从事需要权威与智慧结合的工作，如管理、教育');
      break;
    case '伤官佩印格':
      advice.push('才华横溢，适合艺术、文化、创意产业');
      break;
    case '财官双美格':
      advice.push('财官并美，适合从商或从政，名利双收之象');
      break;
    case '官印相生格':
      advice.push('适合公职、教育、文化等正统行业');
      break;
  }

  return advice;
}

/**
 * 获取格局的详细说明
 */
export function getGejuMeaning(geju: GejuType): string {
  const meanings: Record<GejuType, string> = {
    '正官格': '为人正直，适合从事公职、管理等正统行业',
    '偏官格（七杀格）': '性格果断，适合军警、竞争性行业',
    '正财格': '善于理财，适合从商、金融等行业',
    '偏财格': '财运灵活，适合投资、商业等领域',
    '正印格': '重视学问，适合教育、文化、研究等行业',
    '偏印格（枭神格）': '思维独特，适合偏门学问、技术等领域',
    '食神格': '温和有才，适合服务、餐饮、艺术等行业',
    '伤官格': '才华横溢，适合创意、艺术、技术等领域',
    '比劫格': '重视朋友，适合合伙、团队协作',
    '食神生财格': '以才华创造财富，衣食无忧',
    '伤官佩印格': '才华与学识并重，文武双全',
    '杀印相生格': '权威与智慧结合，适合领导',
    '财官双美格': '财官并美，名利双收',
    '官印相生格': '官印相生，权力与名望兼得',
    '从财格': '顺从财星，适合从商求财',
    '从杀格': '顺从权威,适合辅佐他人',
    '从儿格': '顺从食伤，适合技艺、创作',
    '从强格': '比劫成群，适合独立创业',
    '化气格': '阴阳调和，特殊格局',
    '普通格局': '平常格局，需综合分析',
  };

  return meanings[geju] || '需要进一步分析';
}
