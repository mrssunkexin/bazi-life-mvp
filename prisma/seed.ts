import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a sample report
  const report = await prisma.report.create({
    data: {
      name: '测试用户',
      gender: '男',
      birthDate: '1990-01-01',
      birthTime: '10:00',
      city: '北京',
      title: 'Sample BaZi Analysis Report',
      status: 'draft',
      basicSummary: 'This is a sample BaZi life analysis report for testing purposes.',
      fullContent: '# Full Analysis\n\nThis would contain the detailed BaZi analysis including:\n- Pillars of Destiny\n- Element Analysis\n- Life Path Recommendations',
      formJson: JSON.stringify({
        birthDate: '1990-01-01',
        birthTime: '10:00',
        gender: 'male',
        location: 'Beijing, China'
      }),
    },
  });

  console.log('Created sample report:', report);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
