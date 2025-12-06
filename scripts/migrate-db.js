/**
 * 数据库迁移脚本
 * 用于初始化或更新数据库结构
 */

const { execSync } = require('child_process');

console.log('🚀 开始数据库迁移...\n');

try {
  // 1. 生成 Prisma Client
  console.log('📦 生成 Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client 生成完成\n');

  // 2. 推送数据库结构（适用于云端部署）
  console.log('🔄 推送数据库结构...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ 数据库结构推送完成\n');

  console.log('🎉 数据库迁移成功！');
} catch (error) {
  console.error('❌ 数据库迁移失败:', error.message);
  process.exit(1);
}
