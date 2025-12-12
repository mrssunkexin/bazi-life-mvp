import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// GET single report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 验证userId
    if (!userId) {
      return errorResponse('缺少用户ID', ErrorCodes.VALIDATION_ERROR, 400);
    }

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId // 验证报告归属
      },
    });

    if (!report) {
      return errorResponse('未找到报告或无权访问', ErrorCodes.NOT_FOUND, 404);
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
