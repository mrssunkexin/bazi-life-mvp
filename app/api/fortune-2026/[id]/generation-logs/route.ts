import { NextRequest } from 'next/server';
import { getReportGenerationLogs, getReportTotalDuration, getCurrentStage } from '@/lib/generation-logger';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// GET - 获取2026报告生成日志
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 2026报告固定使用 fortune2026 类型
    const logs = await getReportGenerationLogs(id, 'fortune2026');
    const totalDuration = await getReportTotalDuration(id, 'fortune2026');
    const currentStage = await getCurrentStage(id, 'fortune2026');

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
    console.error('[2026] 获取生成日志失败:', error);
    return errorResponse(error.message || '获取生成日志失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
