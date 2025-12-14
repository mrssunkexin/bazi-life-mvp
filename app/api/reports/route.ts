import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBaziUnified } from '@/lib/bazi-calculator';
import { generateEnhancedReport, mergeFinalReport } from '@/lib/report-generator-enhanced';
import { generateBasicReport } from '@/lib/report-generator-basic';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      gender,
      birthDate,
      birthTime,
      city,
      longitude,
      latitude,
      voucherCode, // 新增：兑换码（可选）
      buttonText, // 新增：提交按钮文字
    } = body;

    // 验证userId
    if (!userId) {
      return errorResponse('缺少用户ID', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse('用户不存在', ErrorCodes.NOT_FOUND, 404);
    }

    // 验证必填字段
    if (!name || !gender || !birthDate || !birthTime || !city) {
      return errorResponse('缺少必填字段', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 获取报告生成模式配置
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let generationMode = 'ai_generation'; // 默认值

    try {
      const configRes = await fetch(`${baseUrl}/api/config?keys=report_generation_mode`);
      const configData = await configRes.json();
      generationMode = configData.data?.report_generation_mode || 'ai_generation';
      console.log(`📋 报告生成模式: ${generationMode}`);
    } catch (error) {
      console.log('⚠️ 获取配置失败，使用默认模式: ai_generation');
    }

    // 计算八字（使用统一入口，确保与2026报告一致）
    const baziResult = calculateBaziUnified({
      birthDate,
      birthTime,
      city,
      longitude,
      latitude
    });

    // 生成标题
    const title = `${name}的八字命理分析报告`;
    const birthYear = new Date(birthDate).getFullYear();

    // 【模式分支】
    if (generationMode === 'algorithm_only') {
      // ==================== 算法模式 ====================
      console.log('🔧 [算法模式] 开始生成纯算法报告...');

      // 生成基础报告
      const basicReport = generateBasicReport({
        reportId: crypto.randomUUID(),
        name,
        gender: gender === 'male' ? '男' : '女',
        birthDate,
        birthTime,
        location: city,
        bazi: baziResult,
        shishen: baziResult.shishen,
        canggan: baziResult.canggan,
        birthYear,
      });

      // 创建报告（立即发布）
      const report = await prisma.report.create({
        data: {
          userId, // 关联用户
          title,
          basicSummary: `${name} 的八字命理基础报告（算法版）\n\n八字：${baziResult.year} ${baziResult.month} ${baziResult.day} ${baziResult.hour}\n五行：${baziResult.wuxing.dominant}旺`,
          fullContent: basicReport,
          status: 'published', // 关键：立即发布
          name,
          gender,
          birthDate,
          birthTime,
          country: '中国',
          city,
          longitude,
          latitude,
          baziYear: baziResult.year,
          baziMonth: baziResult.month,
          baziDay: baziResult.day,
          baziHour: baziResult.hour,
          trueSolarTime: baziResult.trueSolarTime || '',
          wuxing: JSON.stringify(baziResult.wuxing),
          dayun: JSON.stringify(baziResult.dayun || []),
          formJson: JSON.stringify(body),
          generatedAt: new Date(), // 生成时间
          buttonText: buttonText || '五行分析', // 保存按钮文字
        },
      });

      console.log(`✅ [算法模式] 报告已生成 ID: ${report.id}`);

      return successResponse({
        ...report,
        voucherStatus: 'not_required',
        generationMode: 'algorithm',
      }, 201);

    } else {
      // ==================== AI模式 ====================
      console.log('🤖 [AI模式] 检查兑换码状态...');

      // 兑换码验证逻辑
      let voucherStatus: 'valid' | 'invalid' | 'none' = 'none';

      if (voucherCode) {
        // 查询兑换码
        const voucher = await prisma.voucher.findUnique({
          where: { code: voucherCode },
        });

        // 验证兑换码
        if (!voucher || voucher.isUsed) {
          voucherStatus = 'invalid';
          console.log(`❌ 兑换码无效: ${voucherCode}`);
        } else {
          voucherStatus = 'valid';
          console.log(`✅ 兑换码有效: ${voucherCode}`);
        }

        // 兑换码有效：创建"待激活"报告
        const fullContent = '待激活';
        const basicSummary = `您好 ${name}，

您的八字为：
年柱：${baziResult.year}
月柱：${baziResult.month}
日柱：${baziResult.day}
时柱：${baziResult.hour}

五行分析：${baziResult.wuxing.dominant}特征明显

报告待激活，请确认信息后激活。`;

        const report = await prisma.report.create({
          data: {
            userId, // 关联用户
            title,
            basicSummary,
            fullContent,
            status: 'draft',
            name,
            gender,
            birthDate,
            birthTime,
            country: '中国',
            city,
            longitude,
            latitude,
          baziYear: baziResult.year,
          baziMonth: baziResult.month,
          baziDay: baziResult.day,
          baziHour: baziResult.hour,
          trueSolarTime: baziResult.trueSolarTime || '',
          wuxing: JSON.stringify(baziResult.wuxing),
          dayun: JSON.stringify(baziResult.dayun || []),
          formJson: JSON.stringify(body),
          buttonText: buttonText || '五行分析', // 保存按钮文字
        },
      });

        console.log(`📝 [AI模式 + 有码] 报告已创建 ID: ${report.id}, 等待激活`);

        return successResponse({
          ...report,
          voucherStatus,
          voucherCode: voucherCode, // 返回兑换码供后续激活使用
        }, 201);

      } else {
        // 无兑换码：立即生成算法报告
        console.log('🔧 [AI模式 + 无码] 降级为算法报告...');

        // 生成基础报告
        const basicReport = generateBasicReport({
          reportId: crypto.randomUUID(),
          name,
          gender: gender === 'male' ? '男' : '女',
          birthDate,
          birthTime,
          location: city,
          bazi: baziResult,
          shishen: baziResult.shishen,
          canggan: baziResult.canggan,
          birthYear,
        });

        // 创建报告（立即发布）
        const report = await prisma.report.create({
          data: {
            userId, // 关联用户
            title,
            basicSummary: `${name} 的八字命理基础报告（算法版）\n\n八字：${baziResult.year} ${baziResult.month} ${baziResult.day} ${baziResult.hour}\n五行：${baziResult.wuxing.dominant}旺`,
            fullContent: basicReport,
            status: 'published', // 关键：立即发布
            name,
            gender,
            birthDate,
            birthTime,
            country: '中国',
            city,
            longitude,
            latitude,
            baziYear: baziResult.year,
            baziMonth: baziResult.month,
            baziDay: baziResult.day,
            baziHour: baziResult.hour,
            trueSolarTime: baziResult.trueSolarTime || '',
            wuxing: JSON.stringify(baziResult.wuxing),
            dayun: JSON.stringify(baziResult.dayun || []),
            formJson: JSON.stringify(body),
            generatedAt: new Date(), // 生成时间
            buttonText: buttonText || '五行分析', // 保存按钮文字
          },
        });

        console.log(`✅ [AI模式 + 无码] 算法报告已生成 ID: ${report.id}`);

        return successResponse({
          ...report,
          voucherStatus: 'none',
          generationMode: 'algorithm',
        }, 201);
      }
    }
  } catch (error: any) {
    console.error('❌ Error creating report:', error);
    return errorResponse(error.message || 'Failed to create report', ErrorCodes.SERVER_ERROR, 500);
  }
}

// GET - Get all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 如果有 userId,只返回该用户的报告(小程序端)
    // 如果没有 userId,返回所有报告(管理端)
    const reports = await prisma.report.findMany({
      where: userId ? { userId } : {}, // 有userId时过滤,没有时返回全部
      select: {
        id: true,
        userId: true, // 管理端需要看到用户ID
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
        fullContent: true, // 需要返回 fullContent 以判断生成中/待激活状态
        generatedAt: true, // AI生成完成时间
        publishAt: true, // 发布时间
        buttonText: true, // 按钮文字
        // 不返回 basicSummary, wuxing, dayun 等其他大字段
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
