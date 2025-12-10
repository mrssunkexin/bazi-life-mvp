import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBazi } from '@/lib/bazi';
import { generateEnhancedReport, mergeFinalReport } from '@/lib/report-generator-enhanced';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      gender,
      birthDate,
      birthTime,
      city,
      longitude,
      latitude,
    } = body;

    // 验证必填字段
    if (!name || !gender || !birthDate || !birthTime || !city) {
      return errorResponse('缺少必填字段', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 计算八字
    const bazi = calculateBazi(
      birthDate,
      birthTime,
      longitude,
      latitude
    );

    // 生成标题
    const title = `${name}的八字命理分析报告`;
    const birthYear = new Date(birthDate).getFullYear();

    // 先创建草稿报告（只包含基础信息）
    const basicSummary = `您好 ${name}，

您的八字为：
年柱：${bazi.year}
月柱：${bazi.month}
日柱：${bazi.day}
时柱：${bazi.hour}

五行分析：${bazi.wuxing.dominant}特征明显

完整报告正在生成中，请稍候...`;

    const report = await prisma.report.create({
      data: {
        title,
        basicSummary,
        fullContent: '报告生成中...', // 临时内容
        status: 'draft',
        name,
        gender,
        birthDate,
        birthTime,
        country: '中国',
        city,
        longitude,
        latitude,
        baziYear: bazi.year,
        baziMonth: bazi.month,
        baziDay: bazi.day,
        baziHour: bazi.hour,
        trueSolarTime: bazi.trueSolarTime || '',
        wuxing: JSON.stringify(bazi.wuxing),
        formJson: JSON.stringify(body),
      },
    });

    // 异步生成完整报告（不阻塞响应）
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
            birthYear,
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
            birthYear,
          }
        );

        // 更新报告
        await prisma.report.update({
          where: { id: report.id },
          data: {
            basicSummary: result.algorithmSummary.substring(0, 500) + '...',
            fullContent,
            dayun: JSON.stringify(result.analysis.dayun.dayunList),
          },
        });

        console.log(`✅ 报告生成完成 ID: ${report.id}`);
        if (result.tokenEstimate) {
          console.log(`📊 Token: ${result.tokenEstimate.totalTokens}, 成本: $${result.tokenEstimate.estimatedCost.toFixed(4)}`);
        }
      } catch (error) {
        console.error(`❌ 异步生成报告失败 ID: ${report.id}`, error);
        // 更新为错误状态
        await prisma.report.update({
          where: { id: report.id },
          data: {
            fullContent: '报告生成失败，请联系管理员。',
          },
        });
      }
    })();

    // 立即返回报告（此时报告还在生成中）
    return successResponse(report, 201);
  } catch (error: any) {
    console.error('❌ Error creating report:', error);
    return errorResponse(error.message || 'Failed to create report', ErrorCodes.SERVER_ERROR, 500);
  }
}

// GET - Get all reports
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        name: true,
        gender: true,
        birthDate: true,
        birthTime: true,
        city: true,
        status: true,
        baziYear: true,
        baziMonth: true,
        baziDay: true,
        baziHour: true,
        createdAt: true,
        // 不返回 fullContent, basicSummary, wuxing, dayun 等大字段
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // 最多返回100条
    });

    return successResponse(reports);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return errorResponse(error.message || 'Failed to fetch reports', ErrorCodes.SERVER_ERROR, 500);
  }
}
