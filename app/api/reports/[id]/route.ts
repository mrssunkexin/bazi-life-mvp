import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { sendTemplateMessage } from '@/lib/wechat/template-message';

// GET single report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 构建查询条件：如果有userId则验证归属(小程序访问)，否则允许访问任何报告(管理端访问)
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.userId = userId;
    }

    const report = await prisma.report.findFirst({
      where: whereCondition,
    });

    if (!report) {
      return errorResponse('未找到报告', ErrorCodes.NOT_FOUND, 404);
    }

    return successResponse(report);
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return errorResponse(error.message || '获取报告失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// PATCH update report
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, basicSummary, fullContent, status, publishAt } = body;

    // 1. 查询当前报告（包含用户信息）
    const currentReport = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!currentReport) {
      return errorResponse('未找到报告', ErrorCodes.NOT_FOUND, 404);
    }

    // 2. 更新报告
    const report = await prisma.report.update({
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
      console.log('📢 触发公众号消息推送');

      // 异步发送（不阻塞响应）
      sendTemplateMessage({
        mpOpenid: currentReport.user!.mpOpenid!,
        reportId: report.id,
        reportType: 'basic',
        userName: report.name,
        publishTime: report.publishAt || new Date()
      }).catch(err => {
        console.error('模板消息发送失败:', err);
      });
    }

    return successResponse(report);
  } catch (error: any) {
    console.error('Error updating report:', error);
    return errorResponse(error.message || '更新报告失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// PUT update report (kept for backward compatibility)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}
