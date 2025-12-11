import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEnhancedReport, mergeFinalReport } from '@/lib/report-generator-enhanced';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - 激活报告(核销兑换码)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { voucherCode } = body;

    // 1. 查询报告
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        voucher: true
      }
    });

    if (!report) {
      return errorResponse('报告不存在', ErrorCodes.NOT_FOUND, 404);
    }

    // 2. 检查报告是否已经激活
    if (report.fullContent !== '待激活') {
      return errorResponse('报告已激活,无需重复操作', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 3. 验证兑换码
    if (!voucherCode) {
      return errorResponse('请提供兑换码', ErrorCodes.VALIDATION_ERROR, 400);
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode }
    });

    if (!voucher) {
      return errorResponse('兑换码不存在', ErrorCodes.VALIDATION_ERROR, 400);
    }

    if (voucher.isUsed) {
      return errorResponse('兑换码已被使用', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 4. 核销兑换码(绑定到报告)
    await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
        reportId: report.id,
      },
    });

    // 5. 更新报告状态为"生成中"
    await prisma.report.update({
      where: { id: report.id },
      data: {
        fullContent: '报告生成中...',
      },
    });

    console.log(`✅ 兑换码 ${voucherCode} 已核销,绑定到报告 ${report.id}`);

    // 6. 异步生成AI报告
    const { name, gender, birthDate, birthTime, city } = report;
    const formJson = JSON.parse(report.formJson);
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
          },
        });

        console.log(`✅ 报告生成完成 ID: ${report.id}`);
        if (result.tokenEstimate) {
          console.log(`📊 Token: ${result.tokenEstimate.totalTokens}, 成本: $${result.tokenEstimate.estimatedCost.toFixed(4)}`);
        }
      } catch (error) {
        console.error(`❌ 异步生成报告失败 ID: ${report.id}`, error);
        await prisma.report.update({
          where: { id: report.id },
          data: {
            fullContent: '报告生成失败，请联系管理员。',
          },
        });
      }
    })();

    return successResponse({
      message: '激活成功,报告生成中...',
      reportId: report.id
    });

  } catch (error: any) {
    console.error('❌ 激活报告失败:', error);
    return errorResponse(error.message || '激活失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
