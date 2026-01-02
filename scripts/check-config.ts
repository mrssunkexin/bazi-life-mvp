import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConfig() {
  try {
    console.log('🔍 检查配置项...\n');

    const configs = await prisma.configuration.findMany({
      where: {
        key: {
          in: ['show_tab_bar', 'show_fortune_page']
        }
      },
      select: {
        key: true,
        value: true,
        type: true,
        label: true
      }
    });

    if (configs.length === 0) {
      console.log('❌ 未找到配置项，请运行 npx prisma db seed');
    } else {
      console.log('找到配置项：\n');
      configs.forEach(config => {
        console.log(`Key: ${config.key}`);
        console.log(`  Label: ${config.label}`);
        console.log(`  Type: ${config.type}`);
        console.log(`  Value: ${config.value} (原始)`);
        console.log(`  Parsed: ${config.value === 'true'} (布尔值)`);
        console.log('');
      });
    }

    // 检查是否需要修复
    let needFix = false;
    for (const config of configs) {
      if (config.type === 'boolean' && config.value !== 'true' && config.value !== 'false') {
        console.log(`⚠️  ${config.key} 的值不是有效的布尔字符串: "${config.value}"`);
        needFix = true;
      }
    }

    if (needFix) {
      console.log('\n建议运行修复脚本');
    } else {
      console.log('✅ 配置项格式正确');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
