import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { sendTemplateMessage } from '@/lib/wechat/template-message';

// GET - 获取单个2026报告
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log(`📖 获取2026报告详情: ${id}`);

    // 构建查询条件：如果有userId则验证归属(小程序访问)，否则允许访问任何报告(管理端访问)
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.userId = userId;
    }

    const report = await prisma.fortune2026Report.findFirst({
      where: whereCondition,
    });

    if (!report) {
      console.log(`❌ 2026报告未找到: ${id}`);
      return errorResponse('未找到报告', ErrorCodes.NOT_FOUND, 404);
    }

    console.log(`✅ 2026报告获取成功: ${id}, 状态: ${report.status}`);
    return successResponse(report);
  } catch (error: any) {
    console.error('❌ 获取2026报告失败:', error);
    return errorResponse(error.message || '获取报告失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// PATCH - 更新2026报告
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, basicSummary, fullContent, status, publishAt } = body;

    console.log(`📝 更新2026报告: ${id}, 字段: ${Object.keys(body).join(', ')}`);

    // 1. 查询当前报告（包含用户信息）
    const currentReport = await prisma.fortune2026Report.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!currentReport) {
      return errorResponse('未找到报告', ErrorCodes.NOT_FOUND, 404);
    }

    // 2. 更新报告
    const report = await prisma.fortune2026Report.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(basicSummary !== undefined && { basicSummary }),
        ...(fullContent !== undefined && { fullContent }),
        ...(status !== undefined && { status }),
        ...(publishAt !== undefined && { publishAt: publishAt ? new Date(publishAt) : null }),
      },
    });

    // 3. 检测是否需要推送消息
    const isNewlyPublished =
      currentReport.status === 'draft' &&
      status === 'published' &&
      currentReport.user?.mpOpenid &&
      currentReport.user?.subscribeStatus;

    if (isNewlyPublished) {
      console.log('📢 触发公众号消息推送（2026报告）');

      // 异步发送（不阻塞响应）
      sendTemplateMessage({
        mpOpenid: currentReport.user!.mpOpenid!,
        reportId: report.id,
        reportType: 'fortune2026',
        userName: report.name,
        publishTime: report.publishAt || new Date()
      }).catch(err => {
        console.error('模板消息发送失败:', err);
      });
    }

    console.log(`✅ 2026报告更新成功: ${id}`);
    return successResponse(report);
  } catch (error: any) {
    console.error('❌ 更新2026报告失败:', error);
    return errorResponse(error.message || '更新报告失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// PUT - 更新2026报告 (向后兼容)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}
