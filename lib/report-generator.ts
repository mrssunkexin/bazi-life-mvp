/**
 * 报告生成工具
 * 根据模板和八字信息生成完整报告内容
 */

import { BaziInfo, getWuxingSymbolism, getWuxingWeakArea, getBalanceAction } from './bazi';

export interface ReportData {
  // 基本信息
  reportId: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  birthTime: string;
  location: string;

  // 八字信息
  bazi: BaziInfo;
}

/**
 * 生成完整报告内容（Markdown格式）
 */
export function generateFullReport(data: ReportData): string {
  const today = new Date().toLocaleDateString('zh-CN');
  const { bazi, name, gender, birthDate, birthTime, location } = data;

  // 五行分析
  const wuxing = bazi.wuxing;
  const dominantSymbolism = getWuxingSymbolism(wuxing.dominant);
  const weakArea = getWuxingWeakArea(wuxing.weak);
  const balanceAction = getBalanceAction(wuxing.weak);

  // 生成性格特征（基于日干）
  const personality = generatePersonality(bazi.dayGan, gender);

  // 生成事业建议（基于五行主导）
  const career = generateCareerAdvice(wuxing.dominant);

  // 生成财富分析
  const wealth = generateWealthAnalysis(bazi.dayGan, wuxing.dominant);

  // 生成感情分析
  const love = generateLoveAnalysis(gender, bazi.dayGan);

  // 生成健康建议
  const health = generateHealthAdvice(wuxing.weak);

  // 生成流年分析
  const yearAnalysis = generateYearAnalysis(new Date().getFullYear());

  return `# 🌙 八字命理与人生洞察报告

> 报告编号：BXZ-${data.reportId.slice(0, 8)}
> 姓名：${name}
> 出生时间：${birthDate} ${birthTime}
> 性别：${gender}
> 出生地：${location}
> 生成日期：${today}
${bazi.trueSolarTime ? `> 真太阳时：${bazi.trueSolarTime}\n` : ''}
> 本报告基于传统八字理论，结合现代心理与人生周期分析，仅供个人参考与自我觉察使用。

---

## 🕊 第 1 页：命盘总览与五行特征

### 四柱八字
- **年柱**：${bazi.year} (${bazi.naYin.year})
- **月柱**：${bazi.month} (${bazi.naYin.month})
- **日柱**：${bazi.day} (${bazi.naYin.day})
- **时柱**：${bazi.hour} (${bazi.naYin.hour})

### 五行比例
| 木 | 火 | 土 | 金 | 水 |
|---|---|---|---|---|
| ${wuxing.wood}% | ${wuxing.fire}% | ${wuxing.earth}% | ${wuxing.metal}% | ${wuxing.water}% |

> 命盘整体呈现 **${wuxing.dominant}** 特征，倾向以 **${dominantSymbolism}** 的方式感知世界。
>
> 五行中 **${wuxing.weak}** 较弱，说明在 ${weakArea} 上容易波动，建议 ${balanceAction}。

---

## 🌸 第 2 页：性格倾向与内在动力

${personality}

---

## 🔥 第 3 页：事业与行动力

${career}

---

## 💰 第 4 页：财富与资源流动

${wealth}

---

## 💞 第 5 页：感情与人际模式

${love}

---

## 🌿 第 6 页：健康与生活节奏

${health}

---

## 🌏 第 7 页：大运与流年趋势

${yearAnalysis}

---

## 🌠 第 8 页：总结与行动建议

> 你的主调关键词是 **${getKeyword1(bazi.dayGan)} × ${wuxing.dominant} × ${getKeyword3(gender)}**。
>
> 人生主线是「${getLifeTheme(bazi.dayGan, wuxing.dominant)}」。
>
> 当你懂得 ${getInsightPhrase(wuxing.dominant)} 时,你的格局将彻底打开。

**行动建议：**
1. ${getAdvice1(wuxing.dominant)}
2. ${getAdvice2(wuxing.weak)}
3. 每年设定 1-2 个小目标，稳步推进
4. 保持学习与反思的习惯
5. ${getAdvice5(bazi.dayGan)}

> 本报告为趋势参考，不代表命运定论。
`;
}

/**
 * 生成性格分析
 */
function generatePersonality(dayGan: string, gender: string): string {
  const traits: Record<string, { trait1: string; trait2: string; appearance: string; inner: string }> = {
    '甲': { trait1: '创造力', trait2: '独立性', appearance: '积极进取', inner: '追求自由与成长' },
    '乙': { trait1: '柔韧性', trait2: '适应力', appearance: '温和亲切', inner: '内心坚韧' },
    '丙': { trait1: '热情', trait2: '光明', appearance: '阳光开朗', inner: '渴望被认可' },
    '丁': { trait1: '细腻', trait2: '专注', appearance: '温柔体贴', inner: '追求完美' },
    '戊': { trait1: '稳重', trait2: '包容', appearance: '可靠踏实', inner: '追求安全感' },
    '己': { trait1: '耐心', trait2: '细心', appearance: '温和谦逊', inner: '注重细节' },
    '庚': { trait1: '果断', trait2: '正直', appearance: '刚毅坚定', inner: '追求正义' },
    '辛': { trait1: '精致', trait2: '敏锐', appearance: '优雅精明', inner: '追求品质' },
    '壬': { trait1: '智慧', trait2: '灵活', appearance: '机智变通', inner: '追求知识' },
    '癸': { trait1: '细腻', trait2: '包容', appearance: '温柔体贴', inner: '情感丰富' },
  };

  const trait = traits[dayGan] || traits['甲'];

  return `> 你兼具 ${trait.trait1} 与 ${trait.trait2}，外在 ${trait.appearance}，内心 ${trait.inner}。
> 重视个人成长与内在价值，在人际中倾向真诚相待，让人感到温暖可靠，但也会因此对自己要求过高。`;
}

/**
 * 生成事业建议
 */
function generateCareerAdvice(dominant: string): string {
  const careers: Record<string, { style: string; energy: string; industries: string; element: string; value: string; need: string }> = {
    '木': {
      style: '创新开拓',
      energy: '成长与创造',
      industries: '教育、设计、咨询、创意产业',
      element: '木',
      value: '价值创造与影响力',
      need: '明确方向',
    },
    '火': {
      style: '热情主动',
      energy: '表达与影响',
      industries: '传媒、销售、演艺、公关',
      element: '火',
      value: '认可与成就感',
      need: '持续热情',
    },
    '土': {
      style: '稳健务实',
      energy: '积累与沉淀',
      industries: '金融、房地产、管理、行政',
      element: '土',
      value: '稳定与安全',
      need: '突破创新',
    },
    '金': {
      style: '果断高效',
      energy: '执行与决断',
      industries: '法律、金融、技术、制造业',
      element: '金',
      value: '专业与精准',
      need: '灵活变通',
    },
    '水': {
      style: '灵活智慧',
      energy: '思考与洞察',
      industries: '科技、研究、策划、智库',
      element: '水',
      value: '智慧与洞察',
      need: '执行力',
    },
  };

  const career = careers[dominant] || careers['木'];

  return `> 你的行动方式偏向 ${career.style}，追求 ${career.energy}。
>
> 适合行业：${career.industries}（对应 ${career.element} 五行）。
>
> 你对成就的理解偏向 ${career.value}，当缺乏 ${career.need} 时易感到疲惫。
>
> 建议：每年设定 1–2 个小目标，稳步推进。`;
}

/**
 * 生成财富分析
 */
function generateWealthAnalysis(dayGan: string, dominant: string): string {
  const attitudes = ['稳健保守', '积极进取', '灵活变通'][Math.floor(Math.random() * 3)];
  const contexts = ['投资理财', '职业发展', '创业机遇'][Math.floor(Math.random() * 3)];
  const risks = ['过度保守错失机会', '冲动决策', '缺乏长期规划'][Math.floor(Math.random() * 3)];
  const keywords = ['稳健增长', '把握机遇', '开源节流'][Math.floor(Math.random() * 3)];

  return `> 你的财富观为 ${attitudes}。
> 在 ${contexts} 情境下直觉良好，但注意 ${risks}。
>
> 本年财务关键词 **${keywords}**：宜积累资源、培养技能，忌盲目投资、过度消费。`;
}

/**
 * 生成感情分析
 */
function generateLoveAnalysis(gender: string, dayGan: string): string {
  const trait1 = ['真诚', '热情', '细腻'][Math.floor(Math.random() * 3)];
  const trait2 = ['包容', '专注', '独立'][Math.floor(Math.random() * 3)];
  const style = ['直接表达', '含蓄内敛', '行动胜于言语'][Math.floor(Math.random() * 3)];
  const pattern = ['深度连接与理解', '平衡独立与亲密', '成长与陪伴'][Math.floor(Math.random() * 3)];
  const lesson = ['接纳差异', '表达需求', '建立界限'][Math.floor(Math.random() * 3)];

  return `> 你在感情中 ${trait1} 与 ${trait2}，表达倾向 ${style}。
>
> 常经历 ${pattern}，提醒你学习 ${lesson}。
>
> 今年适合深化现有关系，让关系更平衡。`;
}

/**
 * 生成健康建议
 */
function generateHealthAdvice(weak: string): string {
  const areas: Record<string, string> = {
    '木': '肝胆系统与情绪调节',
    '火': '心血管与睡眠质量',
    '土': '脾胃消化与饮食规律',
    '金': '呼吸系统与皮肤',
    '水': '肾脏泌尿与水分代谢',
  };

  const actions: Record<string, string[]> = {
    '木': ['适度运动', '情绪疏导'],
    '火': ['规律作息', '冥想放松'],
    '土': ['饮食规律', '温和调养'],
    '金': ['深呼吸练习', '护肤保养'],
    '水': ['充足饮水', '避免过劳'],
  };

  const area = areas[weak] || areas['木'];
  const action = actions[weak] || actions['木'];

  return `> ${weak} 偏弱，对应 ${area}。
>
> 建议保持 ${action[0]}、${action[1]}，多亲近自然、减少熬夜。
>
> 健康是情绪与身体的协调，当你放慢节奏，灵感会自然浮现。`;
}

/**
 * 生成流年分析
 */
function generateYearAnalysis(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  const decadeEnd = decade + 9;

  return `> 当前大运（${decade}–${decadeEnd}）：主题「稳健成长」，侧重自我提升与资源积累，学习平衡进取与休息。
> 本年（${year}）关键词「突破创新」，聚焦个人发展与能力提升，建议勇于尝试新领域、拓展人脉圈。`;
}

// 辅助函数
function getKeyword1(dayGan: string): string {
  const keywords: Record<string, string> = {
    '甲': '创新', '乙': '柔韧', '丙': '热情', '丁': '专注',
    '戊': '稳重', '己': '细心', '庚': '果断', '辛': '精致',
    '壬': '智慧', '癸': '包容',
  };
  return keywords[dayGan] || '成长';
}

function getKeyword3(gender: string): string {
  return gender === '男' ? '进取' : '和谐';
}

function getLifeTheme(dayGan: string, dominant: string): string {
  return `以${dominant}之力，行${getKeyword1(dayGan)}之道`;
}

function getInsightPhrase(dominant: string): string {
  const phrases: Record<string, string> = {
    '木': '顺势而为，不强求',
    '火': '内敛光芒，照亮内心',
    '土': '厚德载物，包容万物',
    '金': '刚柔并济，收放自如',
    '水': '上善若水，利而不争',
  };
  return phrases[dominant] || '顺应天时，不违本心';
}

function getAdvice1(dominant: string): string {
  const advice: Record<string, string> = {
    '木': '培养创造力，勇于尝试新事物',
    '火': '保持热情，同时学会沉淀',
    '土': '在稳定中寻求突破',
    '金': '坚持原则，也要适度变通',
    '水': '发挥智慧，同时加强执行',
  };
  return advice[dominant] || '保持学习与成长';
}

function getAdvice2(weak: string): string {
  return getBalanceAction(weak as any);
}

function getAdvice5(dayGan: string): string {
  const advice: Record<string, string> = {
    '甲': '保持独立思考，不随波逐流',
    '乙': '坚持自我，温柔而坚定',
    '丙': '内外兼修，平衡光芒与内涵',
    '丁': '专注当下，不过度完美主义',
    '戊': '在安全中突破，在稳定中创新',
    '己': '关注大局，不陷入细节',
    '庚': '刚柔并济，原则与人情兼顾',
    '辛': '追求品质，但不过度苛求',
    '壬': '思考与行动并重',
    '癸': '包容他人，也要保护自己',
  };
  return advice[dayGan] || '保持真实，活出自己';
}
