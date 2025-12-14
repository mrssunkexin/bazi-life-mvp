import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBaziUnified } from '@/lib/bazi-calculator';
import { calculate2026Fortune } from '@/lib/fortune-2026';
import { generate2026FullReport, get2026SolarTerms } from '@/lib/ai-generator-2026';
import type { Fortune2026Context } from '@/lib/ai-generator-2026';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - 激活2026报告并生成AI内容
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { voucherCode } = body;

    console.log(`🎯 [激活] 开始激活2026报告: ${id}`);

    // 1. 验证报告存在且未激活
    const report = await prisma.fortune2026Report.findUnique({
      where: { id },
    });

    if (!report) {
      return errorResponse('报告不存在', ErrorCodes.NOT_FOUND, 404);
    }

    if (report.fullContent !== '待激活') {
      return errorResponse('报告已激活或生成中', ErrorCodes.VALIDATION_ERROR, 400);
    }

    console.log(`📋 [激活] 报告验证通过: ${report.name}`);

    // 2. 验证兑换码
    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode },
    });

    if (!voucher) {
      return errorResponse('兑换码不存在', ErrorCodes.VALIDATION_ERROR, 400);
    }

    if (voucher.isUsed) {
      return errorResponse('兑换码已被使用', ErrorCodes.VALIDATION_ERROR, 400);
    }

    console.log(`✅ [激活] 兑换码验证通过: ${voucherCode}`);

    // 3. 核销兑换码
    await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
        fortune2026ReportId: report.id,
      },
    });

    console.log(`💳 [激活] 兑换码已核销`);

    // 4. 更新报告为"生成中"
    await prisma.fortune2026Report.update({
      where: { id },
      data: {
        fullContent: '报告生成中...',
      },
    });

    // 5. 异步生成AI报告
    (async () => {
      try {
        console.log(`🤖 [AI生成] 开始生成2026报告: ${id}`);

        // 重新计算八字(从报告数据恢复)
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

        // 获取当前大运
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

        // 构建2026专用上下文
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

        // 检查是否有AI API密钥
        const aiApiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY;
        if (!aiApiKey) {
          throw new Error('未配置AI API密钥，无法生成报告');
        }

        // 调用AI生成完整报告
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

        // 更新报告
        await prisma.fortune2026Report.update({
          where: { id },
          data: {
            fullContent: fullReport,
            basicSummary: fullReport.substring(0, 500) + '...',
            generatedAt: new Date(),
            status: 'draft',
          },
        });

        console.log(`✅ [AI生成] 2026报告生成完成: ${id}`);

      } catch (error: any) {
        console.error(`❌ [AI生成] 2026报告生成失败: ${id}`, error);

        // 更新报告为错误状态
        await prisma.fortune2026Report.update({
          where: { id },
          data: {
            fullContent: `生成失败: ${error.message}`,
            status: 'draft',
          },
        });
      }
    })();

    // 6. 立即返回成功响应
    return successResponse({
      message: '报告正在生成中，请稍后查看',
      reportId: id,
      status: 'generating',
    }, 200);

  } catch (error: any) {
    console.error('❌ 激活2026报告失败:', error);
    return errorResponse(error.message || '激活失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
