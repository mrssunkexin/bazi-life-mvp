// 测试 lunar-javascript 导入
const LunarLib = require('lunar-javascript');
const { Solar } = LunarLib;

console.log('=== 测试 lunar-javascript 导入 ===');
console.log('LunarLib类型:', typeof LunarLib);
console.log('Solar类型:', typeof Solar);

try {
  const solar = Solar.fromYmd(2025, 12, 29);
  const lunar = solar.getLunar();

  console.log('\n✅ 创建成功！');
  console.log('公历:', solar.toString());
  console.log('农历:', lunar.toString());
  console.log('干支:', `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`);
  console.log('宜:', lunar.getDayYi().slice(0, 3).join('、'));
  console.log('忌:', lunar.getDayJi().slice(0, 3).join('、'));
} catch (e) {
  console.log('\n❌ 错误:', e.message);
  console.log(e.stack);
}
