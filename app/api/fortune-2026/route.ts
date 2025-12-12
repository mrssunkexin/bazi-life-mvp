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
    const { userId, name, gender, birthDate, birthTime, city, longitude, latitude, voucherCode } = body;

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

    // 算法模式: 立即生成
    if (generationMode === 'algorithm_only') {
      const fortune2026Data = calculate2026Fortune(baziResult, birthYear);
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
          generatedAt: new Date()
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
      // AI模式: 创建draft,等待激活
      // TODO: 实现兑换码验证逻辑(参考现有Report的实现)
      return errorResponse('AI模式暂未实现', ErrorCodes.SERVER_ERROR, 501);
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
