/**
 * 兑换码工具函数
 */

/**
 * 生成随机兑换码
 * @param length 兑换码长度（默认30位）
 * @returns 随机兑换码字符串
 */
export function generateVoucherCode(length: number = 30): string {
  // 使用数字和大写字母（去除易混淆字符：0, O, I, 1, L）
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * 批量生成兑换码
 * @param count 生成数量
 * @param length 兑换码长度（默认30位）
 * @returns 兑换码数组
 */
export function generateVoucherCodes(count: number, length: number = 30): string[] {
  const codes = new Set<string>();

  while (codes.size < count) {
    codes.add(generateVoucherCode(length));
  }

  return Array.from(codes);
}

/**
 * 验证兑换码格式
 * @param code 兑换码
 * @returns 是否有效
 */
export function isValidVoucherCodeFormat(code: string): boolean {
  // 检查长度和字符
  if (!code || code.length !== 30) {
    return false;
  }

  // 只允许数字和大写字母
  const validChars = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/;
  return validChars.test(code);
}
