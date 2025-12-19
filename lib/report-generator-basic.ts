/**
 * 基础算法报告生成器
 * 生成纯算法报告（不含AI），包含：四柱、五行、十神、藏干、纳音
 */

import type { BaziInfo } from './bazi';
import type { ShishenAnalysis, ShishenType } from './bazi-shishen';
import type { CangganAnalysis, CangganResult } from './bazi-canggan';
import { SHISHEN_MEANINGS } from './shishen-meanings';

export interface BasicReportData {
  reportId: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  birthTime: string;
  location: string;
  bazi: BaziInfo;
  shishen: ShishenAnalysis;
  canggan: CangganAnalysis;
  birthYear: number;
}

/**
 * 生成基础算法报告（Markdown格式）
 */
export function generateBasicReport(data: BasicReportData): string {
  const today = new Date().toLocaleDateString('zh-CN');
  const { bazi, shishen, canggan, name, gender, birthDate, birthTime, location } = data;

  // 五行分析
  const wuxing = bazi.wuxing;

  return `# 🌙 生辰五行查询

> 编号：${data.reportId.slice(0, 12).toUpperCase()}
> 姓名：${name}
> 性别：${gender}
> 出生时间：${birthDate} ${birthTime}
> 出生地：${location}
> 生成日期：${today}
> 生成模式：查询五行
${bazi.trueSolarTime ? `> 真太阳时：${bazi.trueSolarTime}\n` : ''}

## 📊 生辰算法查询
### 生辰四柱
| 柱位 | 干支 | 纳音 |
|------|------|------|
| **年柱** | ${bazi.year} | ${bazi.naYin.year} |
| **月柱** | ${bazi.month} | ${bazi.naYin.month} |
| **日柱** | ${bazi.day} | ${bazi.naYin.day} |
| **时柱** | ${bazi.hour} | ${bazi.naYin.hour} |

**日主**：${bazi.dayGan}（本命元神）

### 五行数量查询和比例计算
| 木 | 火 | 土 | 金 | 水 |
|:---:|:---:|:---:|:---:|:---:|
| ${wuxing.wood}% | ${wuxing.fire}% | ${wuxing.earth}% | ${wuxing.metal}% | ${wuxing.water}% |

## 🎭 十神查询
### 天干十神查询
| 位置 | 天干 | 十神 | 含义 |
| **年干** | ${bazi.yearGan} | ${shishen.天干.年干 || '-'} | 
| **月干** | ${bazi.monthGan} | ${shishen.天干.月干 || '-'} | 
| **日干** | ${bazi.dayGan} | 【日主】 | 
| **时干** | ${bazi.hourGan} | ${shishen.天干.时干 || '-'} | 

### 地支十神查询
| 位置 | 地支 | 本气十神 | 含义 |
| **年支** | ${bazi.yearZhi} | ${shishen.地支.年支 || '-'} | 
| **月支** | ${bazi.monthZhi} | ${shishen.地支.月支 || '-'} | 
| **日支** | ${bazi.dayZhi} | ${shishen.地支.日支 || '-'} | 
| **时支** | ${bazi.hourZhi} | ${shishen.地支.时支 || '-'} | 

## 🌿 藏干查询
### 四柱藏干查询
${generateCangganDetails(canggan, bazi)}
### 五行数量查询（含藏干）

| 木 | 火 | 土 | 金 | 水 |
|:---:|:---:|:---:|:---:|:---:|
| ${Math.round(canggan.wuxingStrength['木'] * 100 / getTotalStrength(canggan))}% | ${Math.round(canggan.wuxingStrength['火'] * 100 / getTotalStrength(canggan))}% | ${Math.round(canggan.wuxingStrength['土'] * 100 / getTotalStrength(canggan))}% | ${Math.round(canggan.wuxingStrength['金'] * 100 / getTotalStrength(canggan))}% | ${Math.round(canggan.wuxingStrength['水'] * 100 / getTotalStrength(canggan))}% |

## 🎵 纳音查询
### 纳音古代含义查询
- **年柱纳音**：${bazi.naYin.year}
  - ${getNayinMeaning(bazi.naYin.year)}
- **月柱纳音**：${bazi.naYin.month}
  - ${getNayinMeaning(bazi.naYin.month)}
- **日柱纳音**：${bazi.naYin.day}（本命纳音，最重要）
  - ${getNayinMeaning(bazi.naYin.day)}
- **时柱纳音**：${bazi.naYin.hour}
  - ${getNayinMeaning(bazi.naYin.hour)}

## 📝 查询结果说明
本查询基于传统算法生成，包含以下内容：

- 五行比例查询
- 十神查询
- 地支藏干查询
- 纳音五行查询

> 本查询仅供参考，不构成任何专业建议。

**报告生成时间**：${new Date().toLocaleString('zh-CN')}
`;
}

/**
 * 获取五行含义
 */
function getWuxingMeaning(wuxing: string): string {
  const meanings: Record<string, string> = {
    '木': '代表生发、创造力、成长性，性格上倾向进取、创新',
    '火': '代表热情、光明、表达力，性格上倾向积极、外向',
    '土': '代表稳重、包容、承载力，性格上倾向踏实、可靠',
    '金': '代表果断、正直、执行力，性格上倾向理性、坚定',
    '水': '代表智慧、灵活、流动性，性格上倾向聪明、变通',
  };
  return meanings[wuxing] || '';
}

/**
 * 获取弱势五行补足建议
 */
function getWuxingWeakSuggestion(wuxing: string): string {
  const suggestions: Record<string, string> = {
    '木': '建议多接触绿色植物、参与创意活动、培养耐心',
    '火': '建议多参与社交活动、培养表达能力、保持热情',
    '土': '建议注重基础积累、培养责任感、保持稳定',
    '金': '建议培养决断力、注重原则、强化执行力',
    '水': '建议多读书学习、培养灵活思维、保持流动性',
  };
  return suggestions[wuxing] || '';
}

/**
 * 生成十神统计分析
 */
function generateShishenStatistics(shishen: ShishenAnalysis): string {
  const stats = shishen.统计;
  const mainStar = shishen.特征.主星;
  const tougan = shishen.特征.透干;

  let result = '**十神数量统计**：\n\n';

  const hasCount: [ShishenType, number][] = [];
  (Object.entries(stats) as [ShishenType, number][]).forEach(([ss, count]) => {
    if (count > 0) {
      hasCount.push([ss, count]);
    }
  });

  hasCount.sort((a, b) => b[1] - a[1]);

  hasCount.forEach(([ss, count]) => {
    result += `- **${ss}**：${count}个`;
    if (ss === mainStar) {
      result += ' ⭐（主星）';
    }
    if (tougan.includes(ss)) {
      result += ' 💫（透干）';
    }
    result += '\n';
  });

  if (mainStar) {
    result += `\n**命局特征**：以 **${mainStar}** 为主星，${SHISHEN_MEANINGS[mainStar].description}。\n`;
  }

  if (tougan.length > 0) {
    result += `\n**透干十神**：${tougan.join('、')}（透出天干，力量显著）\n`;
  }

  return result;
}

/**
 * 生成主要十神深度分析
 */
function generateTopShishenAnalysis(shishen: ShishenAnalysis): string {
  const stats = shishen.统计;
  const topThree: [ShishenType, number][] = [];

  (Object.entries(stats) as [ShishenType, number][]).forEach(([ss, count]) => {
    if (count > 0) {
      topThree.push([ss, count]);
    }
  });

  topThree.sort((a, b) => b[1] - a[1]);

  if (topThree.length === 0) {
    return '命局中十神分布较为均衡。';
  }

  let result = '';

  topThree.slice(0, 3).forEach(([ss, count], index) => {
    const info = SHISHEN_MEANINGS[ss];
    result += `#### ${index + 1}. ${ss}（${count}个）\n\n`;
    result += `**基本含义**：${info.description}\n\n`;
    result += `**代表意义**：${info.represents}\n\n`;
    result += `**性格特质**：${info.traits.join('、')}\n\n`;
    result += `**与日主关系**：${info.relationship}\n\n`;
  });

  return result;
}

/**
 * 生成藏干详细分析
 */
function generateCangganDetails(canggan: CangganAnalysis, bazi: BaziInfo): string {
  let output = '';

  const positions: Array<{ name: string; zhi: string; result: CangganResult }> = [
    { name: '年支', zhi: bazi.yearZhi, result: canggan.年支 },
    { name: '月支', zhi: bazi.monthZhi, result: canggan.月支 },
    { name: '日支', zhi: bazi.dayZhi, result: canggan.日支 },
    { name: '时支', zhi: bazi.hourZhi, result: canggan.时支 },
  ];

  positions.forEach(({ name, zhi, result }) => {
    output += `**${name}（${zhi}）**：\n`;
    output += '```\n';
    result.hiddenStems.forEach((hs, index) => {
      const label = index === 0 ? '本气' : index === 1 ? '中气' : '余气';
      output += `${label}: ${hs.gan}（${hs.wuxing}）- ${Math.round(hs.ratio * 100)}%\n`;
    });
    output += '```\n\n';
  });

  return output;
}

/**
 * 生成透干分析
 */
function generateTouganAnalysis(canggan: CangganAnalysis): string {
  const tougan = canggan.透干分析;

  if (tougan.length === 0) {
    return '命局中无明显透干现象。\n';
  }

  let result = '**透干情况**：\n\n';

  tougan.forEach(({ gan, sources }) => {
    result += `- **${gan}** 透出，得 ${sources.join('、')} 支持（力量加倍）\n`;
  });

  result += '\n> 透干代表"天地呼应"，该天干的能量得到地支的强力支撑。\n';

  return result;
}

/**
 * 获取五行总力量
 */
function getTotalStrength(canggan: CangganAnalysis): number {
  return Object.values(canggan.wuxingStrength).reduce((sum, val) => sum + val, 0);
}

/**
 * 获取纳音含义
 */
function getNayinMeaning(nayin: string): string {
  const meanings: Record<string, string> = {
    '海中金': '深藏的金，象征潜力巨大，需要时间展现',
    '炉中火': '旺盛的火焰，热情积极，能量充沛',
    '大林木': '参天大树，根基稳固，成长性强',
    '路旁土': '道路之土，踏实稳重，承载力强',
    '剑锋金': '锋利的剑，果断干脆，执行力强',
    '山头火': '山顶之火，高亢明亮，领导力强',
    '涧下水': '溪水涓涓，灵活变通，滋润万物',
    '城头土': '城墙之土，稳固可靠，防御力强',
    '白蜡金': '精炼的金，纯粹坚定，品质优良',
    '杨柳木': '柳树枝条，柔韧灵活，适应力强',
    '泉中水': '泉水清澈，智慧纯净，源源不断',
    '屋上土': '房屋之土，保护性强，安全稳定',
    '霹雳火': '闪电之火，爆发力强，瞬间光芒',
    '松柏木': '常青松柏，坚韧长久，不畏寒冬',
    '长流水': '江河之水，持续流动，影响深远',
    '沙中金': '沙里藏金，需要淘洗，终见光芒',
    '山下火': '山脚之火，温和持久，照亮近处',
    '平地木': '平原树木，广泛分布，影响范围大',
    '壁上土': '墙壁之土，装饰性强，文化内涵',
    '金箔金': '金箔装饰，精致华丽，注重外表',
    '覆灯火': '灯火之光，照明指引，智慧之火',
    '天河水': '天上之水，包容宏大，格局高远',
    '大驿土': '驿站之土，交通要道，连接八方',
    '钗钏金': '首饰之金，装饰华美，重视形象',
    '桑柘木': '桑树之木，实用价值，养蚕织丝',
    '大溪水': '溪流之水，活泼灵动，充满生机',
    '沙中土': '沙土之地，需要培育，潜力可期',
    '天上火': '天空之火，光芒万丈，影响广远',
    '石榴木': '石榴之木，硕果累累，收获丰盛',
    '大海水': '海洋之水，包容万象，气度恢宏',
  };
  return meanings[nayin] || '具有独特的能量特质';
}

/**
 * 获取纳音总结
 */
function getNayinSummary(nayin: string): string {
  const summaries: Record<string, string> = {
    '海中金': '如同深海中的宝藏，您具有深厚的潜力和内涵，需要时间和机遇来展现真正的价值。',
    '炉中火': '如同炉火般炽热旺盛，您拥有充沛的能量和热情，能够照亮和温暖周围的人。',
    '大林木': '如同森林中的大树，您根基稳固，成长力强，能够为他人提供庇护和支持。',
    '路旁土': '如同道路之土，您踏实可靠，能够承载和支撑他人，是值得信赖的伙伴。',
    '剑锋金': '如同锋利的宝剑，您果断干脆，执行力强，能够破除障碍，直达目标。',
    '山头火': '如同山顶的火把，您位置高亢，光芒明亮，具有领导力和影响力。',
    '涧下水': '如同山涧溪流，您灵活变通，润物无声，能够适应各种环境。',
    '城头土': '如同城墙之土，您稳固可靠，防御力强，能够保护自己和家人。',
    '白蜡金': '如同精炼的白金，您品质纯粹，坚定不移，具有高贵的气质。',
    '杨柳木': '如同杨柳枝条，您柔韧灵活，适应力强，能够在逆境中生存。',
    '泉中水': '如同清泉之水，您智慧纯净，源源不断，能够滋润和启发他人。',
    '屋上土': '如同屋顶之土，您保护性强，能够为家人提供安全和稳定。',
    '霹雳火': '如同闪电之火，您爆发力强，能够在瞬间展现惊人的能量。',
    '松柏木': '如同常青松柏，您坚韧长久，不畏艰难，具有持久的生命力。',
    '长流水': '如同长江大河，您持续流动，影响深远，能够带来持久的变化。',
    '沙中金': '如同沙里藏金，您需要经历淘洗和磨练，才能展现真正的价值。',
    '山下火': '如同山脚之火，您温和持久，能够照亮身边的人和事。',
    '平地木': '如同平原树木，您分布广泛，影响范围大，能够造福更多人。',
    '壁上土': '如同墙壁装饰，您注重文化内涵，具有装饰性和艺术性。',
    '金箔金': '如同金箔装饰，您精致华丽，注重外表和形象。',
    '覆灯火': '如同灯火之光，您能够照明和指引，是智慧的象征。',
    '天河水': '如同天上之水，您包容宏大，格局高远，具有广阔的视野。',
    '大驿土': '如同驿站之土，您能够连接八方，是沟通的桥梁。',
    '钗钏金': '如同精美首饰，您华美装饰，重视形象和品味。',
    '桑柘木': '如同桑树之木，您具有实用价值，能够为他人带来实际利益。',
    '大溪水': '如同溪流之水，您活泼灵动，充满生机和活力。',
    '沙中土': '如同沙土之地，您需要培育和开发，潜力可期。',
    '天上火': '如同天空之火，您光芒万丈，影响广远，具有远大的抱负。',
    '石榴木': '如同石榴之木，您硕果累累，收获丰盛，能够享受成功的果实。',
    '大海水': '如同浩瀚海洋，您包容万象，气度恢宏，具有无限的可能性。',
  };
  return summaries[nayin] || '您具有独特的生命能量特质。';
}
