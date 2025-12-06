/**
 * 神煞查表系统
 * 根据四柱查找各类吉凶神煞
 */

// 神煞类型
export type ShenShaType =
  // 吉神
  | '天乙贵人' | '天德贵人' | '月德贵人'
  | '文昌贵人' | '学堂' | '词馆'
  | '天厨' | '福星贵人' | '三奇'
  | '国印贵人' | '金舆'
  // 桃花类
  | '咸池' | '红鸾' | '天喜'
  // 凶煞
  | '羊刃' | '飞刃' | '劫煞'
  | '灾煞' | '天煞' | '亡神'
  | '孤辰' | '寡宿'
  | '元辰' | '空亡'
  // 其他
  | '驿马' | '华盖' | '将星'
  | '桃花' | '天医' | '禄神';

// 神煞信息
export interface ShenSha {
  name: ShenShaType;
  pillar: '年柱' | '月柱' | '日柱' | '时柱';
  position: '天干' | '地支';
  category: '吉神' | '凶煞' | '中性' | '桃花';
  description: string;
}

// 神煞分析结果
export interface ShenShaAnalysis {
  all: ShenSha[];
  吉神: ShenSha[];
  凶煞: ShenSha[];
  桃花: ShenSha[];
  中性: ShenSha[];
}

/**
 * 天干序号映射 (0-9)
 */
const GAN_INDEX: Record<string, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9,
};

/**
 * 地支序号映射 (0-11)
 */
const ZHI_INDEX: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
};

/**
 * 反向查找地支
 */
const INDEX_TO_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 天乙贵人查表
 * 口诀：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢虎马，此是贵人方
 */
const TIANYI_GUIREN: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '庚': ['丑', '未'],
  '辛': ['寅', '午'],
};

/**
 * 文昌贵人查表
 * 口诀：甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见兔入云梯
 */
const WENCHANG: Record<string, string> = {
  '甲': '巳', '乙': '午',
  '丙': '申', '戊': '申',
  '丁': '酉', '己': '酉',
  '庚': '亥', '辛': '子',
  '壬': '寅', '癸': '卯',
};

/**
 * 咸池（桃花）查表
 * 口诀：寅午戌兔从茅里出，亥卯未鼠子当头跑，申子辰鸡见酉上叫，巳酉丑马跃午途
 */
const XIANCHI_MAP: Record<string, string> = {
  '寅': '卯', '午': '卯', '戌': '卯',
  '亥': '子', '卯': '子', '未': '子',
  '申': '酉', '子': '酉', '辰': '酉',
  '巳': '午', '酉': '午', '丑': '午',
};

/**
 * 驿马查表
 * 口诀：申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳
 */
const YIMA_MAP: Record<string, string> = {
  '申': '寅', '子': '寅', '辰': '寅',
  '寅': '申', '午': '申', '戌': '申',
  '巳': '亥', '酉': '亥', '丑': '亥',
  '亥': '巳', '卯': '巳', '未': '巳',
};

/**
 * 华盖查表
 * 口诀：寅午戌见戌，巳酉丑见丑，申子辰见辰，亥卯未见未
 */
const HUAGAI_MAP: Record<string, string> = {
  '寅': '戌', '午': '戌', '戌': '戌',
  '巳': '丑', '酉': '丑', '丑': '丑',
  '申': '辰', '子': '辰', '辰': '辰',
  '亥': '未', '卯': '未', '未': '未',
};

/**
 * 羊刃查表（以日干查地支）
 * 口诀：甲羊刃在卯，乙在寅，丙戊在午，丁己在巳，庚在酉，辛在申，壬在子，癸在亥
 */
const YANGREN_MAP: Record<string, string> = {
  '甲': '卯', '乙': '寅',
  '丙': '午', '戊': '午',
  '丁': '巳', '己': '巳',
  '庚': '酉', '辛': '申',
  '壬': '子', '癸': '亥',
};

/**
 * 禄神查表（以日干查地支）
 * 口诀：甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子
 */
const LUSHEN_MAP: Record<string, string> = {
  '甲': '寅', '乙': '卯',
  '丙': '巳', '戊': '巳',
  '丁': '午', '己': '午',
  '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子',
};

/**
 * 空亡查表（以日柱查）
 * 六十甲子分为六旬，每旬有两个空亡
 */
const KONGWANG_MAP: Record<string, string[]> = {
  // 甲子旬：戌亥空
  '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'],
  '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'], '己巳': ['戌', '亥'],
  '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],

  // 甲戌旬：申酉空
  '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'],
  '丁丑': ['申', '酉'], '戊寅': ['申', '酉'], '己卯': ['申', '酉'],
  '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],

  // 甲申旬：午未空
  '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'],
  '丁亥': ['午', '未'], '戊子': ['午', '未'], '己丑': ['午', '未'],
  '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],

  // 甲午旬：辰巳空
  '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'],
  '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'], '己亥': ['辰', '巳'],
  '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],

  // 甲辰旬：寅卯空
  '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'],
  '丁未': ['寅', '卯'], '戊申': ['寅', '卯'], '己酉': ['寅', '卯'],
  '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],

  // 甲寅旬：子丑空
  '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'],
  '丁巳': ['子', '丑'], '戊午': ['子', '丑'], '己未': ['子', '丑'],
  '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑'],
};

/**
 * 神煞描述
 */
const SHENSHA_DESCRIPTIONS: Record<ShenShaType, string> = {
  '天乙贵人': '逢凶化吉，遇难呈祥，得贵人相助',
  '天德贵人': '福德深厚，逢凶化吉',
  '月德贵人': '福德深厚，逢凶化吉',
  '文昌贵人': '聪明好学，利于学业和文化事业',
  '学堂': '勤奋好学，智慧聪颖',
  '词馆': '文采斐然，善于表达',
  '天厨': '衣食丰足，享受美食',
  '福星贵人': '福气深厚，一生平顺',
  '三奇': '才华出众，天赋异禀',
  '国印贵人': '掌权执印，有领导才能',
  '金舆': '财富丰厚，生活富足',
  '咸池': '异性缘佳，但需注意感情困扰',
  '红鸾': '婚姻喜庆，感情顺利',
  '天喜': '喜事临门，心情愉悦',
  '羊刃': '性格刚强，易有争斗',
  '飞刃': '易有意外伤害',
  '劫煞': '财物易散，需防破财',
  '灾煞': '易遇灾祸，需谨慎行事',
  '天煞': '易遇挫折，需坚韧应对',
  '亡神': '易有损失，需防小人',
  '孤辰': '性格孤独，人际关系较弱',
  '寡宿': '婚姻不顺，易有孤独感',
  '元辰': '运势起伏，需平稳心态',
  '空亡': '虚耗不实，计划易落空',
  '驿马': '走动频繁，利于外出发展',
  '华盖': '聪明孤高，喜欢艺术和宗教',
  '将星': '有领导才能，善于指挥',
  '桃花': '异性缘佳，魅力出众',
  '天医': '利于医学和养生',
  '禄神': '俸禄丰厚，财运亨通',
};

/**
 * 查找天乙贵人
 */
function findTianyiGuiren(gan: string, zhiList: string[]): string[] {
  const guirenZhi = TIANYI_GUIREN[gan] || [];
  return zhiList.filter(zhi => guirenZhi.includes(zhi));
}

/**
 * 查找文昌贵人
 */
function findWenchang(gan: string, zhiList: string[]): string[] {
  const wenchang = WENCHANG[gan];
  return zhiList.filter(zhi => zhi === wenchang);
}

/**
 * 查找咸池（桃花）
 */
function findXianchi(zhi: string, zhiList: string[]): string[] {
  const xianchi = XIANCHI_MAP[zhi];
  if (!xianchi) return [];
  return zhiList.filter(z => z === xianchi);
}

/**
 * 查找驿马
 */
function findYima(zhi: string, zhiList: string[]): string[] {
  const yima = YIMA_MAP[zhi];
  if (!yima) return [];
  return zhiList.filter(z => z === yima);
}

/**
 * 查找华盖
 */
function findHuagai(zhi: string, zhiList: string[]): string[] {
  const huagai = HUAGAI_MAP[zhi];
  if (!huagai) return [];
  return zhiList.filter(z => z === huagai);
}

/**
 * 查找羊刃
 */
function findYangren(gan: string, zhiList: string[]): string[] {
  const yangren = YANGREN_MAP[gan];
  if (!yangren) return [];
  return zhiList.filter(z => z === yangren);
}

/**
 * 查找禄神
 */
function findLushen(gan: string, zhiList: string[]): string[] {
  const lushen = LUSHEN_MAP[gan];
  if (!lushen) return [];
  return zhiList.filter(z => z === lushen);
}

/**
 * 查找空亡
 */
function findKongwang(dayGanzhi: string, zhiList: string[]): string[] {
  const kongwangZhi = KONGWANG_MAP[dayGanzhi] || [];
  return zhiList.filter(zhi => kongwangZhi.includes(zhi));
}

/**
 * 计算完整的神煞分析
 */
export function calculateShenSha(bazi: {
  yearGan: string;
  monthGan: string;
  dayGan: string;
  hourGan: string;
  yearZhi: string;
  monthZhi: string;
  dayZhi: string;
  hourZhi: string;
  year?: string;  // 年柱干支（如"甲子"）
  month?: string; // 月柱干支
  day?: string;   // 日柱干支
  hour?: string;  // 时柱干支
}): ShenShaAnalysis {
  const allShenSha: ShenSha[] = [];

  const zhiList = [bazi.yearZhi, bazi.monthZhi, bazi.dayZhi, bazi.hourZhi];
  const zhiPositions: ('年柱' | '月柱' | '日柱' | '时柱')[] = ['年柱', '月柱', '日柱', '时柱'];

  // 1. 天乙贵人（以日干或年干查）
  const tianyiInDay = findTianyiGuiren(bazi.dayGan, zhiList);
  tianyiInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '天乙贵人',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '吉神',
        description: SHENSHA_DESCRIPTIONS['天乙贵人'],
      });
    }
  });

  // 2. 文昌贵人（以日干或年干查）
  const wenchangInDay = findWenchang(bazi.dayGan, zhiList);
  wenchangInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '文昌贵人',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '吉神',
        description: SHENSHA_DESCRIPTIONS['文昌贵人'],
      });
    }
  });

  // 3. 咸池（桃花）- 以年支或日支查
  const xianchiInDay = findXianchi(bazi.dayZhi, zhiList);
  xianchiInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '咸池',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '桃花',
        description: SHENSHA_DESCRIPTIONS['咸池'],
      });
    }
  });

  // 4. 驿马 - 以日支查
  const yimaInDay = findYima(bazi.dayZhi, zhiList);
  yimaInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '驿马',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '中性',
        description: SHENSHA_DESCRIPTIONS['驿马'],
      });
    }
  });

  // 5. 华盖 - 以日支查
  const huagaiInDay = findHuagai(bazi.dayZhi, zhiList);
  huagaiInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '华盖',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '中性',
        description: SHENSHA_DESCRIPTIONS['华盖'],
      });
    }
  });

  // 6. 羊刃 - 以日干查
  const yangrenInDay = findYangren(bazi.dayGan, zhiList);
  yangrenInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '羊刃',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '凶煞',
        description: SHENSHA_DESCRIPTIONS['羊刃'],
      });
    }
  });

  // 7. 禄神 - 以日干查
  const lushenInDay = findLushen(bazi.dayGan, zhiList);
  lushenInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '禄神',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '吉神',
        description: SHENSHA_DESCRIPTIONS['禄神'],
      });
    }
  });

  // 8. 空亡 - 以日柱查
  const dayGanzhi = bazi.day || `${bazi.dayGan}${bazi.dayZhi}`;
  const kongwangInDay = findKongwang(dayGanzhi, zhiList);
  kongwangInDay.forEach(zhi => {
    const idx = zhiList.indexOf(zhi);
    if (idx >= 0) {
      allShenSha.push({
        name: '空亡',
        pillar: zhiPositions[idx],
        position: '地支',
        category: '凶煞',
        description: SHENSHA_DESCRIPTIONS['空亡'],
      });
    }
  });

  // 分类整理
  const 吉神 = allShenSha.filter(s => s.category === '吉神');
  const 凶煞 = allShenSha.filter(s => s.category === '凶煞');
  const 桃花 = allShenSha.filter(s => s.category === '桃花');
  const 中性 = allShenSha.filter(s => s.category === '中性');

  return {
    all: allShenSha,
    吉神,
    凶煞,
    桃花,
    中性,
  };
}

/**
 * 获取神煞的简要总结
 */
export function getShenShaSummary(analysis: ShenShaAnalysis): string {
  const parts: string[] = [];

  if (analysis.吉神.length > 0) {
    parts.push(`吉神${analysis.吉神.length}个：${analysis.吉神.map(s => s.name).join('、')}`);
  }

  if (analysis.凶煞.length > 0) {
    parts.push(`凶煞${analysis.凶煞.length}个：${analysis.凶煞.map(s => s.name).join('、')}`);
  }

  if (analysis.桃花.length > 0) {
    parts.push(`桃花${analysis.桃花.length}个：${analysis.桃花.map(s => s.name).join('、')}`);
  }

  if (parts.length === 0) {
    return '命局平和，无明显吉凶神煞';
  }

  return parts.join('；');
}
