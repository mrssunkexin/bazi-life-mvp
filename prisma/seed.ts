import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充数据库...');

  // 1. 填充配置数据
  const configs = [
    {
      key: 'app_title',
      value: '生辰五行',
      type: 'text',
      label: '小程序标题',
      description: '首页显示的标题文字'
    },
    {
      key: 'show_voucher_code',
      value: 'true',
      type: 'boolean',
      label: '显示兑换码',
      description: '-'
    },
    {
      key: 'report_generation_mode',
      value: 'ai_generation',
      type: 'text',
      label: '报告生成模式',
      description: 'algorithm_only或ai_generation'
    },
    {
      key: 'submit_button_text',
      value: '五行分析',
      type: 'text',
      label: '立即测算按钮文字',
      description: '首页提交按钮文字,最多14字符'
    },
    {
      key: 'show_fortune_2026_button',
      value: 'true',
      type: 'boolean',
      label: '显示2026运势按钮',
      description: '控制首页是否显示2026运势测算按钮'
    },
    {
      key: 'fortune_2026_button_text',
      value: '2026运势分析',
      type: 'text',
      label: '2026运势按钮文字',
      description: '2026运势按钮文字,最多14字符'
    },
    {
      key: 'show_basic_report_button',
      value: 'false',
      type: 'boolean',
      label: '显示基础报告按钮',
      description: '控制首页是否显示基础/八字测算按钮'
    },
    {
      key: 'waiting_show_notify',
      value: 'true',
      type: 'boolean',
      label: '等待页显示通知提示',
      description: '控制等待页“完成后将第一时间通知您”文案是否显示'
    },
    {
      key: 'waiting_show_qr',
      value: 'true',
      type: 'boolean',
      label: '等待页显示公众号二维码',
      description: '控制等待页二维码提示卡片是否显示'
    },
    {
      key: 'show_fortune_page',
      value: 'false',
      type: 'boolean',
      label: '运势页面',
      description: '控制运势页面（五行查询）是否显示。选择"true"时显示完整功能，选择"false"时仅显示提示文案'
    },
    {
      key: 'show_tab_bar',
      value: 'false',
      type: 'boolean',
      label: '功能栏',
      description: '控制小程序底部功能栏（TabBar）是否显示。选择"true"时显示三个tab（黄历、运势、我的），选择"false"时隐藏功能栏'
    }
  ];

  console.log('📝 填充配置项...');
  for (const config of configs) {
    await prisma.configuration.upsert({
      where: { key: config.key },
      update: config,
      create: config
    });
    console.log(`  ✅ ${config.key}: ${config.value}`);
  }

  console.log('✨ 数据库填充完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
