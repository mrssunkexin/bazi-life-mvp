import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

/**
 * GET - 获取报告列表(基础报告 + 2026报告)
 *
 * - 有userId参数: 返回该用户的报告(小程序用)
 * - 无userId参数: 返回所有报告(管理端用)
 *
 * 返回混合列表,按创建时间倒序排列
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 构建查询条件：如果有userId则筛选该用户，否则查询所有
    const whereCondition = userId ? { userId } : {};

    console.log(`📊 查询混合报告列表: ${userId ? `userId=${userId}` : '所有报告(管理端)'}`);

    // 并行查询两种报告
    const [basicReports, fortune2026Reports] = await Promise.all([
      prisma.report.findMany({
        where: whereCondition,
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
          generatedAt: true,
          publishAt: true,
          fullContent: true,  // 管理端需要判断状态
        },
        orderBy: { createdAt: 'desc' },
        take: 100,  // 管理端可能需要查看更多
      }),
      prisma.fortune2026Report.findMany({
        where: whereCondition,
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
          generatedAt: true,
          publishAt: true,
          buttonText: true,
          fullContent: true,  // 管理端需要判断状态
        },
        orderBy: { createdAt: 'desc' },
        take: 100,  // 管理端可能需要查看更多
      }),
    ]);

    // 为每种报告添加类型标识
    const basicReportsWithType = basicReports.map((report) => ({
      ...report,
      reportType: 'basic' as const,
      buttonText: '五行分析',
    }));

    const fortune2026ReportsWithType = fortune2026Reports.map((report) => ({
      ...report,
      reportType: 'fortune2026' as const,
      buttonText: report.buttonText || '2026运势分析',
    }));

    // 合并并按创建时间倒序排序
    const allReports = [...basicReportsWithType, ...fortune2026ReportsWithType].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(
      `📊 获取混合报告列表: 基础报告${basicReports.length}条, 2026报告${fortune2026Reports.length}条, 总计${allReports.length}条`
    );

    return successResponse({
      reports: allReports,
      summary: {
        total: allReports.length,
        basicCount: basicReports.length,
        fortune2026Count: fortune2026Reports.length,
      },
    });
  } catch (error: any) {
    console.error('❌ 获取混合报告列表失败:', error);
    return errorResponse(error.message || '获取失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
