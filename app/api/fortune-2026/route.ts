import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBaziUnified } from '@/lib/bazi-calculator';
import { calculate2026Fortune } from '@/lib/fortune-2026';
import { generate2026Report } from '@/lib/report-generator-2026';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - 创建2026运势报告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, gender, birthDate, birthTime, city, longitude, latitude, voucherCode, buttonText } = body;
    const autoActivate = body.autoActivate !== false; // 默认自动触发激活，除非显式关闭

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

    // 获取配置 (直接从数据库读取,避免内部HTTP调用问题)
    let generationMode = 'ai_generation';
    try {
      const config = await prisma.configuration.findUnique({
        where: { key: 'report_generation_mode' }
      });
      generationMode = config?.value || 'ai_generation';
      console.log(`📋 2026报告生成模式: ${generationMode}`);
    } catch (error) {
      console.log('⚠️ 获取配置失败,使用默认模式: ai_generation');
    }

    // 统一计算八字
    const baziResult = calculateBaziUnified({
      birthDate,
      birthTime,
      city,
      longitude,
      latitude
    });

    const title = `${name}的2026年流年运势报告`;
    const birthYear = new Date(birthDate).getFullYear();

    // 计算2026运势数据(两种模式都需要)
    const fortune2026Data = calculate2026Fortune(baziResult, birthYear);

    // 算法模式: 立即生成
    if (generationMode === 'algorithm_only') {
      const fullContent = generate2026Report({
        reportId: crypto.randomUUID(),
        name,
        gender,
        birthDate,
        birthTime,
        location: city,
        bazi: baziResult,
        fortune2026: fortune2026Data,
        birthYear
      });

      const report = await prisma.fortune2026Report.create({
        data: {
          userId, // 关联用户
          title,
          basicSummary: `${name}的2026年运势分析`,
          fullContent,
          status: 'published',
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
          fortune2026Data: JSON.stringify(fortune2026Data),
          formJson: JSON.stringify(body),
          generatedAt: new Date(),
          buttonText: buttonText || '2026运势分析' // 保存按钮文字
        }
      });

      console.log(`✅ 2026报告创建成功 (算法模式): ${report.id}`);

      return successResponse({
        id: report.id,
        status: report.status,
        title: report.title,
        voucherStatus: 'not_required',
        generationMode: 'algorithm'
      }, 201);

    } else {
      // AI模式: 必须有兑换码
      console.log('🤖 [AI模式] 处理2026报告创建...');

      // 1. 验证兑换码必填
      if (!voucherCode || voucherCode.trim() === '') {
        return errorResponse('请输入兑换码', ErrorCodes.VALIDATION_ERROR, 400);
      }

      // 2. 验证兑换码有效性
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode },
      });

      if (!voucher) {
        return errorResponse('兑换码不存在', ErrorCodes.VALIDATION_ERROR, 400);
      }

      if (voucher.isUsed) {
        return errorResponse('兑换码已被使用', ErrorCodes.VALIDATION_ERROR, 400);
      }

      console.log(`✅ 兑换码验证通过: ${voucherCode}`);

      // 3. 创建"待激活"报告
      const report = await prisma.fortune2026Report.create({
        data: {
          userId,
          title,
          basicSummary: `${name} 的2026年运势报告待激活`,
          fullContent: '待激活',
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
          fortune2026Data: JSON.stringify(fortune2026Data),
          formJson: JSON.stringify(body),
          buttonText: buttonText || '2026运势分析',
        },
      });

      console.log(`📝 [AI] 2026报告已创建 ID: ${report.id}, 等待激活`);

      // 4. 可选：自动触发激活（核销 + 生成）
      let activationResult: { success: boolean; message: string } | null = null;
      if (autoActivate) {
        try {
          // 优先使用环境变量，生产环境应配置为 https://www.dralexlp.com
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          console.log(`[激活调用] 使用URL: ${baseUrl}/api/fortune-2026/${report.id}/activate`);
          const activateRes = await fetch(`${baseUrl}/api/fortune-2026/${report.id}/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voucherCode }),
          });

          const activateData = await activateRes.json();
          const successFlag = activateRes.ok && activateData?.success !== false;
          activationResult = {
            success: successFlag,
            message: activateData?.message || activateData?.error || (successFlag ? '激活请求已触发' : '激活请求失败'),
          };

          if (successFlag) {
            console.log(`🚀 [AI] 2026报告激活已触发: ${report.id}`);
          } else {
            console.error(`⚠️ [AI] 2026报告激活失败: ${report.id}`, activationResult.message);
          }
        } catch (error: any) {
          activationResult = {
            success: false,
            message: error?.message || '激活请求异常',
          };
          console.error('❌ [AI] 触发激活失败:', error);
        }
      }

      return successResponse({
        id: report.id,
        status: 'draft',
        voucherStatus: 'valid',
        voucherCode,
        message: autoActivate ? '报告已创建,正在激活生成' : '报告已创建,请激活以生成完整内容',
        activationTriggered: autoActivate,
        activationResult,
      }, 201);
    }
  } catch (error: any) {
    console.error('❌ 创建2026报告失败:', error);
    return errorResponse(error.message || '创建失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// GET - 获取2026报告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 验证userId
    if (!userId) {
      return errorResponse('缺少用户ID', ErrorCodes.VALIDATION_ERROR, 400);
    }

    const reports = await prisma.fortune2026Report.findMany({
      where: { userId }, // 只返回当前用户的报告
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
        fullContent: true,
        generatedAt: true,
        publishAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    console.log(`📊 获取2026报告列表: ${reports.length}条`);

    return successResponse(reports);
  } catch (error: any) {
    console.error('❌ 获取2026报告列表失败:', error);
    return errorResponse(error.message || '获取失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
