import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBaziUnified } from '@/lib/bazi-calculator';
import { generate2026FullReport, get2026SolarTerms } from '@/lib/ai-generator-2026';
import type { Fortune2026Context } from '@/lib/ai-generator-2026';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - 重新生成2026报告（不涉及激活/核销）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.fortune2026Report.findUnique({ where: { id } });

    if (!report) {
      return errorResponse('报告不存在', ErrorCodes.NOT_FOUND, 404);
    }

    // 标记生成中
    await prisma.fortune2026Report.update({
      where: { id },
      data: {
        fullContent: '报告生成中...',
        status: 'draft',
      },
    });

    // 异步生成
    (async () => {
      try {
        // 重新计算八字
        const baziResult = calculateBaziUnified({
          birthDate: report.birthDate,
          birthTime: report.birthTime,
          city: report.city,
          longitude: report.longitude ?? undefined,
          latitude: report.latitude ?? undefined,
        });

        // 解析2026数据
        const fortune2026Data = JSON.parse(report.fortune2026Data || '{}');
        const birthYear = new Date(report.birthDate).getFullYear();
        const currentYear = 2026;
        const age = currentYear - birthYear + 1; // 虚岁

        // 当前大运
        const dayunList = JSON.parse(report.dayun || '[]');
        let currentDayun = '未知';
        if (dayunList && dayunList.length > 0) {
          const currentAge = age;
          for (const dayun of dayunList) {
            if (currentAge >= dayun.startAge && currentAge < dayun.endAge) {
              currentDayun = dayun.ganzhi;
              break;
            }
          }
        }

        const context: Fortune2026Context = {
          name: report.name,
          gender: report.gender === 'male' ? '男' : '女',
          birthDate: report.birthDate,
          birthTime: report.birthTime,
          location: report.city,
          bazi: {
            year: report.baziYear,
            month: report.baziMonth,
            day: report.baziDay,
            hour: report.baziHour,
          },
          wuxing: JSON.parse(report.wuxing || '{}'),
          shishen: baziResult.shishen,
          year2026: {
            ganzhi: '丙午',
            age,
            dayun: currentDayun,
          },
          solarTerms: get2026SolarTerms(),
        };

        const aiApiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY;
        if (!aiApiKey) {
          throw new Error('未配置AI API密钥，无法生成报告');
        }

        const fullReport = await generate2026FullReport(
          context,
          {
            apiKey: aiApiKey,
            provider: (process.env.AI_PROVIDER as any) || 'deepseek',
            model: process.env.AI_MODEL,
            baseURL: process.env.AI_BASE_URL,
          },
          report.id
        );

        await prisma.fortune2026Report.update({
          where: { id },
          data: {
            fullContent: fullReport,
            basicSummary: fullReport.substring(0, 500) + '...',
            generatedAt: new Date(),
            status: 'draft',
          },
        });

        console.log(`✅ [再生成] 2026报告完成: ${id}`);
      } catch (error: any) {
        console.error(`❌ [再生成] 2026报告失败: ${id}`, error);
        await prisma.fortune2026Report.update({
          where: { id },
          data: {
            fullContent: `生成失败: ${error.message}`,
            status: 'draft',
          },
        });
      }
    })();

    return successResponse({
      message: '报告重新生成中...',
      reportId: id,
      status: 'generating',
    });
  } catch (error: any) {
    console.error('❌ 重新生成2026报告失败:', error);
    return errorResponse(error.message || '重新生成失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
