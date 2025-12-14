/**
 * AI生成日志记录工具
 * 用于跟踪报告生成的各个阶段和耗时
 */

import { prisma } from './prisma';

export type GenerationStage =
  | '开始生成'
  | '算法分析'
  | 'AI生成-性格分析'
  | 'AI生成-事业运势'
  | 'AI生成-财运分析'
  | 'AI生成-婚姻感情'
  | 'AI生成-健康养生'
  | 'AI生成-人际关系'
  | 'AI生成-大运分析'
  | 'AI生成-流年预测'
  | 'AI生成-综合建议'
  | '合并报告'
  | '保存数据库'
  | '完成';

export type LogStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface LogMetadata {
  tokens?: number;
  cost?: number;
  provider?: string;
  model?: string;
  [key: string]: any;
}

/**
 * 创建生成日志记录
 */
export async function createGenerationLog(
  reportId: string,
  stage: GenerationStage,
  reportType: 'basic' | 'fortune2026' = 'basic'
) {
  const startTime = new Date();

  const log = reportType === 'basic'
    ? await prisma.generationLog.create({
        data: {
          reportId,
          stage,
          status: 'pending',
          startTime,
        },
      })
    : await prisma.fortune2026GenerationLog.create({
        data: {
          reportId,
          stage,
          status: 'pending',
          startTime,
        },
      });

  const reportIdShort = reportId.substring(0, 8);
  console.log(`📝 [${reportIdShort}] ${stage} - 开始`);

  return log.id;
}

/**
 * 更新日志状态为处理中
 */
export async function markLogProcessing(
  logId: string,
  reportType: 'basic' | 'fortune2026' = 'basic'
) {
  if (reportType === 'basic') {
    await prisma.generationLog.update({
      where: { id: logId },
      data: {
        status: 'processing',
        startTime: new Date(),
      },
    });
  } else {
    await prisma.fortune2026GenerationLog.update({
      where: { id: logId },
      data: {
        status: 'processing',
        startTime: new Date(),
      },
    });
  }
}

/**
 * 完成日志记录
 */
export async function completeGenerationLog(
  logId: string,
  metadata?: LogMetadata,
  reportType: 'basic' | 'fortune2026' = 'basic'
) {
  const log = reportType === 'basic'
    ? await prisma.generationLog.findUnique({ where: { id: logId } })
    : await prisma.fortune2026GenerationLog.findUnique({ where: { id: logId } });

  if (!log || !log.startTime) {
    console.warn(`⚠️  日志记录不存在或缺少开始时间: ${logId}`);
    return;
  }

  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - log.startTime.getTime()) / 1000);

  if (reportType === 'basic') {
    await prisma.generationLog.update({
      where: { id: logId },
      data: {
        status: 'completed',
        endTime,
        duration,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } else {
    await prisma.fortune2026GenerationLog.update({
      where: { id: logId },
      data: {
        status: 'completed',
        endTime,
        duration,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  const reportIdShort = log.reportId.substring(0, 8);
  const tokenInfo = metadata?.tokens ? `, tokens: ${metadata.tokens}` : '';
  console.log(`✅ [${reportIdShort}] ${log.stage} - 完成 (${duration}秒)${tokenInfo}`);
}

/**
 * 失败日志记录
 */
export async function failGenerationLog(
  logId: string,
  errorMessage: string,
  reportType: 'basic' | 'fortune2026' = 'basic'
) {
  const log = reportType === 'basic'
    ? await prisma.generationLog.findUnique({ where: { id: logId } })
    : await prisma.fortune2026GenerationLog.findUnique({ where: { id: logId } });

  if (!log) {
    console.warn(`⚠️  日志记录不存在: ${logId}`);
    return;
  }

  const endTime = new Date();
  const duration = log.startTime
    ? Math.floor((endTime.getTime() - log.startTime.getTime()) / 1000)
    : 0;

  if (reportType === 'basic') {
    await prisma.generationLog.update({
      where: { id: logId },
      data: {
        status: 'failed',
        endTime,
        duration,
        errorMessage,
      },
    });
  } else {
    await prisma.fortune2026GenerationLog.update({
      where: { id: logId },
      data: {
        status: 'failed',
        endTime,
        duration,
        errorMessage,
      },
    });
  }

  const reportIdShort = log.reportId.substring(0, 8);
  console.error(`❌ [${reportIdShort}] ${log.stage} - 失败 (${duration}秒): ${errorMessage}`);
}

/**
 * 获取报告的所有生成日志
 */
export async function getReportGenerationLogs(
  reportId: string,
  reportType: 'basic' | 'fortune2026' = 'basic'
) {
  return reportType === 'basic'
    ? await prisma.generationLog.findMany({
        where: { reportId },
        orderBy: { createdAt: 'asc' },
      })
    : await prisma.fortune2026GenerationLog.findMany({
        where: { reportId },
        orderBy: { createdAt: 'asc' },
      });
}

/**
 * 获取报告生成的总耗时
 */
export async function getReportTotalDuration(
  reportId: string,
  reportType: 'basic' | 'fortune2026' = 'basic'
): Promise<number> {
  const logs = await getReportGenerationLogs(reportId, reportType);

  return logs.reduce((total: number, log: any) => total + (log.duration || 0), 0);
}

/**
 * 获取当前生成阶段
 */
export async function getCurrentStage(
  reportId: string,
  reportType: 'basic' | 'fortune2026' = 'basic'
): Promise<string | null> {
  const latestLog = reportType === 'basic'
    ? await prisma.generationLog.findFirst({
        where: { reportId },
        orderBy: { createdAt: 'desc' },
      })
    : await prisma.fortune2026GenerationLog.findFirst({
        where: { reportId },
        orderBy: { createdAt: 'desc' },
      });

  if (!latestLog) return null;

  if (latestLog.status === 'processing') {
    return `${latestLog.stage} (进行中)`;
  } else if (latestLog.status === 'failed') {
    return `${latestLog.stage} (失败)`;
  } else if (latestLog.status === 'completed') {
    return `${latestLog.stage} (已完成)`;
  }

  return latestLog.stage;
}
