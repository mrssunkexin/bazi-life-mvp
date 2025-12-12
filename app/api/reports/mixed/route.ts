import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// GET - 获取混合报告列表(基础八字 + 2026运势)
export async function GET() {
  try {
    console.log('📊 获取混合报告列表...');

    // 并发查询两种类型的报告
    const [basicReports, fortune2026Reports] = await Promise.all([
      prisma.report.findMany({
        select: {
          id: true,
          name: true,
          gender: true,
          birthDate: true,
          birthTime: true,
          city: true,
          status: true,
          baziYear: true,
          baziMonth: true,
          baziDay: true,
          baziHour: true,
          createdAt: true,
          fullContent: true,
          generatedAt: true,
          publishAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.fortune2026Report.findMany({
        select: {
          id: true,
          name: true,
          gender: true,
          birthDate: true,
          birthTime: true,
          city: true,
          status: true,
          baziYear: true,
          baziMonth: true,
          baziDay: true,
          baziHour: true,
          createdAt: true,
          fullContent: true,
          generatedAt: true,
          publishAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ]);

    console.log(`✅ 基础报告: ${basicReports.length}条, 2026报告: ${fortune2026Reports.length}条`);

    // 添加类型标识并合并
    const mixedReports = [
      ...basicReports.map(r => ({ ...r, reportType: 'basic' })),
      ...fortune2026Reports.map(r => ({ ...r, reportType: 'fortune2026' }))
    ];

    // 按创建时间排序
    mixedReports.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`📋 混合列表总计: ${mixedReports.length}条`);

    return successResponse(mixedReports);
  } catch (error: any) {
    console.error('❌ 获取混合报告列表失败:', error);
    return errorResponse(error.message || '获取失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
