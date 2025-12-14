import { NextRequest } from 'next/server';
import { getReportGenerationLogs, getReportTotalDuration, getCurrentStage } from '@/lib/generation-logger';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// GET - 获取报告生成日志
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reportType = (searchParams.get('reportType') || 'basic') as 'basic' | 'fortune2026';

    // 获取所有日志
    const logs = await getReportGenerationLogs(id, reportType);

    // 获取总耗时
    const totalDuration = await getReportTotalDuration(id, reportType);

    // 获取当前阶段
    const currentStage = await getCurrentStage(id, reportType);

    return successResponse({
      logs,
      totalDuration,
      currentStage,
      summary: {
        totalLogs: logs.length,
        completedLogs: logs.filter((l: any) => l.status === 'completed').length,
        failedLogs: logs.filter((l: any) => l.status === 'failed').length,
        processingLogs: logs.filter((l: any) => l.status === 'processing').length,
      }
    });
  } catch (error: any) {
    console.error('获取生成日志失败:', error);
    return errorResponse(error.message || '获取生成日志失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
