/**
 * AI 提示词管理
 * 从配置文件读取提示词
 */

import fs from 'fs';
import path from 'path';

export type PromptSection =
  | '性格分析'
  | '事业运势'
  | '财运分析'
  | '婚姻感情'
  | '健康养生'
  | '人际关系'
  | '大运分析'
  | '流年预测'
  | '综合建议';

interface PromptConfig {
  systemPrompt: string;
  sectionPrompts: Record<PromptSection, string>;
}

let cachedPrompts: PromptConfig | null = null;

/**
 * 从配置文件解析提示词
 */
function parsePromptsFromFile(): PromptConfig {
  try {
    const configPath = path.join(process.cwd(), '.claude', 'aoitishici.md');

    if (!fs.existsSync(configPath)) {
      console.warn('⚠️  提示词配置文件不存在，使用默认提示词');
      return getDefaultPrompts();
    }

    const content = fs.readFileSync(configPath, 'utf-8');

    // 提取系统提示词
    const systemMatch = content.match(/## 系统提示词.*?\n\n([\s\S]*?)\n---/);
    const systemPrompt = systemMatch ? systemMatch[1].trim() : getDefaultSystemPrompt();

    // 提取各章节提示词
    const sectionPrompts: Partial<Record<PromptSection, string>> = {};

    const sections: PromptSection[] = [
      '性格分析',
      '事业运势',
      '财运分析',
      '婚姻感情',
      '健康养生',
      '人际关系',
      '大运分析',
      '流年预测',
      '综合建议',
    ];

    for (const section of sections) {
      const regex = new RegExp(`### ${section}\\n\\n([\\s\\S]*?)\\n---`, 'm');
      const match = content.match(regex);
      if (match) {
        sectionPrompts[section] = match[1].trim();
      } else {
        console.warn(`⚠️  未找到章节 "${section}" 的提示词，使用默认值`);
        sectionPrompts[section] = getDefaultSectionPrompt(section);
      }
    }

    console.log('✅ 成功从配置文件加载提示词');

    return {
      systemPrompt,
      sectionPrompts: sectionPrompts as Record<PromptSection, string>,
    };
  } catch (error) {
    console.error('❌ 解析提示词配置文件失败，使用默认提示词:', error);
    return getDefaultPrompts();
  }
}

/**
 * 获取系统提示词
 */
export function getSystemPrompt(): string {
  if (!cachedPrompts) {
    cachedPrompts = parsePromptsFromFile();
  }
  return cachedPrompts.systemPrompt;
}

/**
 * 获取章节提示词
 */
export function getSectionPrompt(section: PromptSection): string {
  if (!cachedPrompts) {
    cachedPrompts = parsePromptsFromFile();
  }
  return cachedPrompts.sectionPrompts[section] || getDefaultSectionPrompt(section);
}

/**
 * 重新加载提示词（用于热更新）
 */
export function reloadPrompts(): void {
  cachedPrompts = parsePromptsFromFile();
  console.log('🔄 提示词已重新加载');
}

/**
 * 默认系统提示词（作为后备）
 */
function getDefaultSystemPrompt(): string {
  return `你是一位经验丰富的专业命理师，精通八字命理学。

你的任务是根据提供的八字信息，生成专业、准确、有深度的命理分析报告。

要求：
1. **专业性**：使用专业的命理术语，但要确保普通用户也能理解
2. **准确性**：严格基于提供的八字数据进行分析，不要凭空臆测
3. **留有余地**：使用"倾向于"、"可能"、"建议"等词汇，避免绝对化表述
4. **正面引导**：即使是不利的分析，也要给出积极的建议和化解方法
5. **结构清晰**：使用分段、小标题等方式，使内容易读
6. **避免禁忌话题**：
   - 不分析童年家庭（易断错，引发售后）
   - 不分析学业（易断错，引发售后）
   - 不做绝对预言
   - 不涉及生死疾病的绝对判断

语言风格：
- 温和、专业、有深度
- 既有命理专业性，又要通俗易懂
- 多用"您"而非"你"
- 适当使用命理术语，但要解释含义`;
}

/**
 * 默认章节提示词（作为后备）
 */
function getDefaultSectionPrompt(section: PromptSection): string {
  const defaults: Record<PromptSection, string> = {
    '性格分析': `请从以下角度分析性格特点：
1. 基本性格（基于日干、五行、十神）
2. 优点与长处
3. 可能的性格弱点
4. 人格魅力
5. 性格建议

注意：要客观、全面，既说优点也说缺点，但要正面引导。`,

    '事业运势': `请从以下角度分析事业运势：
1. 适合的行业领域（基于五行、格局、用神）
2. 事业发展特点
3. 职业优势
4. 可能的挑战
5. 事业建议

注意：不要做绝对判断，用"适合"、"倾向于"等表述。`,

    '财运分析': `请从以下角度分析财运：
1. 财运总体特征（基于财星、格局）
2. 正财与偏财
3. 财富积累方式
4. 理财建议
5. 注意事项

注意：避免预测具体金额，用"较好"、"一般"等模糊表述。`,

    '婚姻感情': `请从以下角度分析婚姻感情：
1. 感情特质（基于桃花、官杀、配偶宫）
2. 婚姻缘分
3. 感情中的优势
4. 可能的感情课题
5. 感情建议

注意：避免预测离婚、丧偶等负面内容，多用"需要注意"、"建议"等词。`,

    '健康养生': `请从以下角度分析健康：
1. 体质特点（基于五行平衡）
2. 需要关注的部位（基于五行缺失、过旺）
3. 养生建议
4. 生活习惯建议

注意：不诊断疾病，只提示"需要关注"、"建议保养"等。`,

    '人际关系': `请从以下角度分析人际关系：
1. 社交特点（基于十神）
2. 贵人运
3. 人际优势
4. 需要注意的方面
5. 人际建议`,

    '大运分析': `请分析大运对命主的影响：
1. 当前大运的特点
2. 对各方面的影响（事业、财运、感情等）
3. 这个阶段的机遇
4. 需要注意的事项
5. 具体建议

注意：用"倾向于"、"可能"等词，避免绝对化。`,

    '流年预测': `请分析流年运势：
1. 流年的总体特征
2. 对各方面的影响
3. 重要时间节点
4. 机遇与挑战
5. 应对建议

注意：避免预测具体事件，多用"适合"、"注意"等建议性词汇。`,

    '综合建议': `请给出综合性的人生建议：
1. 发展方向总结
2. 人生阶段规划
3. 需要培养的品质
4. 需要避免的误区
5. 最重要的建议

注意：要鼓励、积极、正面，给人力量。`,
  };

  return defaults[section];
}

/**
 * 获取完整的默认提示词配置（作为后备）
 */
function getDefaultPrompts(): PromptConfig {
  const sections: PromptSection[] = [
    '性格分析',
    '事业运势',
    '财运分析',
    '婚姻感情',
    '健康养生',
    '人际关系',
    '大运分析',
    '流年预测',
    '综合建议',
  ];

  const sectionPrompts: Record<PromptSection, string> = {} as any;
  sections.forEach((section) => {
    sectionPrompts[section] = getDefaultSectionPrompt(section);
  });

  return {
    systemPrompt: getDefaultSystemPrompt(),
    sectionPrompts,
  };
}

/**
 * 获取2026运势报告系统提示词
 */
export function getSystemPrompt2026(): string {
  try {
    const configPath = path.join(process.cwd(), '.claude', 'aoitishici.md');
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️  提示词配置文件不存在,使用默认2026系统提示词');
      return getDefault2026SystemPrompt();
    }

    const content = fs.readFileSync(configPath, 'utf-8');

    const regex = /## 2026运势报告专用提示词[\s\S]*?### 系统提示词\s*\n\n([\s\S]*?)\n---/;
    const match = content.match(regex);

    if (match) {
      console.log('✅ [2026] 成功加载2026系统提示词');
      return match[1].trim();
    }

    console.warn('⚠️  未找到2026系统提示词段落,使用默认值');
    return getDefault2026SystemPrompt();
  } catch (error) {
    console.error('❌ [2026] 读取提示词失败:', error);
    return getDefault2026SystemPrompt();
  }
}

/**
 * 默认2026系统提示词（作为后备）
 */
function getDefault2026SystemPrompt(): string {
  return `你是一位精通流年运势分析的专业命理师。

你的任务是为2026年(丙午年)生成完整流畅的流年运势报告,一次性输出包含8个章节的连贯报告。

核心要求:
1. 完整性: 一次输出全部8章节,前后呼应
2. 流畅性: 章节间过渡自然,避免重复
3. 时序性: 结合24节气标注重要时间节点
4. 专业性: 基于八字与流年干支的生克关系分析
5. 留有余地: 避免绝对化预测
6. 正面引导: 给予积极建议

报告结构(严格按顺序):
1. 基础信息与命盘概览 (500-800字)
2. 2026流年简述 (800-1200字)
3. 事业运势 (1000-1500字)
4. 财运分析 (1000-1500字)
5. 感情婚姻 (1000-1500字)
6. 健康养生 (800-1200字)
7. 人际关系 (800-1200字)
8. 开运建议与免责声明 (600-1000字)

总字数: 8000-12000字`;
}
