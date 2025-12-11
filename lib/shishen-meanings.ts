/**
 * 十神含义对照表
 * 提供每个十神的详细解释和特质
 */

import type { ShishenType } from './bazi-shishen';

export interface ShishenMeaningInfo {
  name: string;
  description: string;
  traits: string[];
  relationship: string; // 与日主关系
  represents: string;   // 代表人事物
}

export const SHISHEN_MEANINGS: Record<ShishenType, ShishenMeaningInfo> = {
  '比肩': {
    name: '比肩',
    description: '与日主同五行同阴阳,代表平等竞争关系',
    traits: ['独立自主', '坚持己见', '竞争意识', '不善妥协', '自我意识强'],
    relationship: '同类',
    represents: '兄弟姐妹、同事、竞争对手、朋友'
  },

  '劫财': {
    name: '劫财',
    description: '与日主同五行不同阴阳,代表协作与争夺',
    traits: ['善于合作', '外向活跃', '争夺性强', '处事果断', '重视利益'],
    relationship: '同类异性',
    represents: '兄弟姐妹（异性）、合作伙伴、竞争者'
  },

  '食神': {
    name: '食神',
    description: '日主所生且同阴阳,代表才华的自然流露',
    traits: ['温和平稳', '才艺出众', '善于表达', '乐观开朗', '注重享受'],
    relationship: '我生',
    represents: '才华、口才、子女、饮食、创作'
  },

  '伤官': {
    name: '伤官',
    description: '日主所生但阴阳不同,代表强烈的表现欲',
    traits: ['聪明机敏', '个性鲜明', '富有创意', '不守成规', '敢于批判'],
    relationship: '我生异性',
    represents: '创造力、反叛性、口才辩论、艺术才华'
  },

  '偏财': {
    name: '偏财',
    description: '日主所克且同阴阳,代表意外之财',
    traits: ['善于把握机会', '投资眼光', '人缘广泛', '慷慨大方', '重视现实'],
    relationship: '我克',
    represents: '父亲、投资、意外之财、业务往来'
  },

  '正财': {
    name: '正财',
    description: '日主所克但阴阳不同,代表稳定收入',
    traits: ['务实稳重', '勤劳节俭', '重视家庭', '责任感强', '循规蹈矩'],
    relationship: '我克异性',
    represents: '工资、妻子（男命）、固定收入、财产'
  },

  '偏官': {
    name: '偏官',
    description: '克制日主且同阴阳,代表压力与挑战',
    traits: ['魄力十足', '不怕困难', '行事果决', '有威严', '承受压力'],
    relationship: '克我',
    represents: '挑战、压力、权力、武职、意外事件'
  },

  '正官': {
    name: '正官',
    description: '克制日主但阴阳不同,代表正规权力',
    traits: ['遵守规则', '责任心强', '注重名誉', '自律严谨', '稳重保守'],
    relationship: '克我异性',
    represents: '职位、官职、丈夫（女命）、法律、约束'
  },

  '偏印': {
    name: '偏印',
    description: '生扶日主且同阴阳,代表非正统学问',
    traits: ['思维独特', '兴趣广泛', '善于钻研', '独来独往', '不喜约束'],
    relationship: '生我',
    represents: '继母、偏门学问、宗教玄学、设计创意'
  },

  '正印': {
    name: '正印',
    description: '生扶日主但阴阳不同,代表正统学问',
    traits: ['聪明好学', '记忆力强', '重视文化', '善良宽厚', '有耐心'],
    relationship: '生我异性',
    represents: '母亲、学问、文凭、名誉、贵人'
  },
};

/**
 * 获取十神的简短描述
 */
export function getShishenBriefDescription(shishen: ShishenType): string {
  return SHISHEN_MEANINGS[shishen].description;
}

/**
 * 获取十神的特质列表
 */
export function getShishenTraits(shishen: ShishenType): string[] {
  return SHISHEN_MEANINGS[shishen].traits;
}

/**
 * 获取十神代表的人事物
 */
export function getShishenRepresents(shishen: ShishenType): string {
  return SHISHEN_MEANINGS[shishen].represents;
}

/**
 * 获取十神与日主的关系
 */
export function getShishenRelationship(shishen: ShishenType): string {
  return SHISHEN_MEANINGS[shishen].relationship;
}
