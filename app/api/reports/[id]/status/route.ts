import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// 报告生成状态
type GenerationStatus = 'generating' | 'completed' | 'failed';

interface StatusResponse {
  status: GenerationStatus;
  progress: number;  // 0-100
  message: string;
}

// GET - 获取报告生成状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取报告
    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        fullContent: true,
        status: true,
      },
    });

    if (!report) {
      return errorResponse('未找到报告', ErrorCodes.NOT_FOUND, 404);
    }

    // 判断生成状态
    let statusData: StatusResponse;

    if (report.fullContent === '报告生成失败，请联系管理员。') {
      // 生成失败
      statusData = {
        status: 'failed',
        progress: 0,
        message: '报告生成失败',
      };
    } else if (report.fullContent === '报告生成中...') {
      // 仍在生成中
      statusData = {
        status: 'generating',
        progress: 50,  // 简化处理，实际可以更精细
        message: '正在生成报告...',
      };
    } else {
      // 生成完成
      statusData = {
        status: 'completed',
        progress: 100,
        message: '报告生成完成',
      };
    }

    return successResponse(statusData);
  } catch (error: any) {
    console.error('Error checking report status:', error);
    return errorResponse(error.message || '查询状态失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
