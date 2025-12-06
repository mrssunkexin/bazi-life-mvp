/**
 * 城市经纬度查询工具
 */

import citiesData from '@/data/cities.json';

export interface City {
  name: string;
  pinyin: string;
  province: string;
  longitude: number;
  latitude: number;
}

/**
 * 获取所有城市
 */
export function getAllCities(): City[] {
  return citiesData.cities;
}

/**
 * 根据城市名称查找城市（支持拼音和汉字）
 */
export function findCity(query: string): City | null {
  const lowerQuery = query.toLowerCase().trim();

  return citiesData.cities.find(
    city =>
      city.name === query ||
      city.pinyin === lowerQuery ||
      city.name.includes(query) ||
      city.pinyin.includes(lowerQuery)
  ) || null;
}

/**
 * 搜索城市（模糊匹配，返回多个结果）
 */
export function searchCities(query: string, limit = 10): City[] {
  if (!query || query.trim() === '') {
    return citiesData.cities.slice(0, limit);
  }

  const lowerQuery = query.toLowerCase().trim();

  // 精确匹配优先
  const exactMatches = citiesData.cities.filter(
    city =>
      city.name === query ||
      city.pinyin === lowerQuery
  );

  if (exactMatches.length > 0) {
    return exactMatches.slice(0, limit);
  }

  // 模糊匹配
  const fuzzyMatches = citiesData.cities.filter(
    city =>
      city.name.includes(query) ||
      city.pinyin.includes(lowerQuery) ||
      city.province.includes(query)
  );

  return fuzzyMatches.slice(0, limit);
}

/**
 * 根据省份获取城市列表
 */
export function getCitiesByProvince(province: string): City[] {
  return citiesData.cities.filter(city => city.province === province);
}

/**
 * 获取所有省份列表
 */
export function getProvinces(): string[] {
  const provinces = new Set(citiesData.cities.map(city => city.province));
  return Array.from(provinces).sort();
}
