import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEnhancedReport, mergeFinalReport } from '@/lib/report-generator-enhanced';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - 重新生成报告
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🔄 开始重新生成报告: ${id}`);

    // 1. 查询报告
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return errorResponse('报告不存在', ErrorCodes.NOT_FOUND, 404);
    }

    // 2. 检查报告是否需要重新生成
    const needsRegeneration =
      report.fullContent === '待激活' ||
      report.fullContent === '报告生成中...' ||
      report.fullContent?.includes('报告生成失败') ||
      report.fullContent?.includes('错误类型') ||
      report.fullContent?.includes('错误信息');

    if (!needsRegeneration) {
      return errorResponse('该报告不需要重新生成', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 3. 更新报告状态为"生成中"
    await prisma.report.update({
      where: { id: report.id },
      data: {
        fullContent: '报告生成中...',
      },
    });

    console.log(`✅ 报告状态已更新为"生成中" ID: ${report.id}`);

    // 4. 异步生成AI报告
    const { name, gender, birthDate, birthTime, city } = report;
    const bazi = {
      year: report.baziYear,
      month: report.baziMonth,
      day: report.baziDay,
      hour: report.baziHour,
      wuxing: JSON.parse(report.wuxing || '{}')
    };

    (async () => {
      try {
        console.log(`🚀 开始异步生成报告 ID: ${report.id}...`);

        const result = await generateEnhancedReport(
          {
            reportId: report.id,
            name,
            gender: gender === 'male' ? '男' : '女',
            birthDate,
            birthTime,
            location: city,
            bazi,
            birthYear: new Date(birthDate).getFullYear(),
          },
          {
            useAI: !!process.env.AI_API_KEY,
            apiKey: process.env.AI_API_KEY,
            provider: (process.env.AI_PROVIDER as 'deepseek' | 'claude' | 'openai') || 'deepseek',
            model: process.env.AI_MODEL,
            baseURL: process.env.AI_BASE_URL,
          }
        );

        const fullContent = mergeFinalReport(
          result.algorithmSummary,
          result.aiSections,
          {
            reportId: report.id,
            name,
            gender: gender === 'male' ? '男' : '女',
            birthDate,
            birthTime,
            location: city,
            bazi,
            birthYear: new Date(birthDate).getFullYear(),
          }
        );

        // 更新报告
        await prisma.report.update({
          where: { id: report.id },
          data: {
            basicSummary: result.algorithmSummary.substring(0, 500) + '...',
            fullContent,
            dayun: JSON.stringify(result.analysis.dayun.dayunList),
            generatedAt: new Date(),
            status: 'draft', // AI 生成完成后保持草稿，待人工发布
          },
        });

        console.log(`✅ 报告重新生成完成 ID: ${report.id}`);
        if (result.tokenEstimate) {
          console.log(`📊 Token: ${result.tokenEstimate.totalTokens}, 成本: $${result.tokenEstimate.estimatedCost.toFixed(4)}`);
        }
      } catch (error) {
        console.error(`❌ 异步重新生成报告失败 ID: ${report.id}`, error);

        // 构建详细的错误信息
        let errorMessage = '报告生成失败\n\n';
        if (error instanceof Error) {
          errorMessage += `错误类型: ${error.name}\n`;
          errorMessage += `错误信息: ${error.message}\n\n`;
          if (error.stack) {
            errorMessage += `堆栈信息:\n${error.stack.split('\n').slice(0, 5).join('\n')}`;
          }
        } else {
          errorMessage += `错误信息: ${String(error)}`;
        }

        await prisma.report.update({
          where: { id: report.id },
          data: {
            fullContent: errorMessage,
            status: 'draft',
          },
        });
      }
    })();

    return successResponse({
      message: '报告正在重新生成中...',
      reportId: report.id
    });

  } catch (error: any) {
    console.error('❌ 重新生成报告失败:', error);
    return errorResponse(error.message || '重新生成失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
