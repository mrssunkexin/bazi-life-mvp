/**
 * 八字计算统一入口
 * 确保两种报告使用相同的计算逻辑
 */

import { calculateBazi, type BaziInfo } from './bazi';
import { calculateShishen } from './bazi-shishen';
import { calculateCanggan } from './bazi-canggan';

export interface BaziCalculationInput {
  birthDate: string;
  birthTime: string;
  city: string;
  longitude?: number;
  latitude?: number;
}

export interface BaziCalculationResult extends BaziInfo {
  shishen: any;
  canggan: any;
  dayun?: any;
}

/**
 * 统一的八字计算入口
 * 确保两种报告使用相同的计算逻辑
 */
export function calculateBaziUnified(input: BaziCalculationInput): BaziCalculationResult {
  // 1. 计算基础八字
  const bazi = calculateBazi(
    input.birthDate,
    input.birthTime,
    input.longitude,
    input.latitude
  );

  // 2. 计算十神
  const shishen = calculateShishen(bazi);

  // 3. 计算藏干
  const canggan = calculateCanggan(bazi);

  return {
    ...bazi,
    shishen,
    canggan
  };
}
