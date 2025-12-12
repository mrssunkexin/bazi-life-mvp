import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`📖 获取2026报告详情: ${id}`);

    const report = await prisma.fortune2026Report.findUnique({
      where: { id }
    });

    if (!report) {
      console.log(`⚠️ 2026报告未找到: ${id}`);
      return errorResponse('未找到报告', ErrorCodes.NOT_FOUND, 404);
    }

    console.log(`✅ 2026报告获取成功: ${id}, 状态: ${report.status}`);

    return successResponse(report);
  } catch (error: any) {
    console.error(`❌ 获取2026报告详情失败:`, error);
    return errorResponse(error.message || '获取失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
