import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

/**
 * POST - 升级算法版报告为AI版
 * 基于算法版报告的信息创建新的AI版报告（待激活）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: algorithmReportId } = await params;
    const body = await request.json();
    const { voucherCode } = body;

    // 验证兑换码
    if (!voucherCode || typeof voucherCode !== 'string') {
      return errorResponse('请提供兑换码', ErrorCodes.VALIDATION_ERROR, 400);
    }

    if (voucherCode.length !== 30) {
      return errorResponse('兑换码格式错误', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 查询原算法版报告
    const algorithmReport = await prisma.report.findUnique({
      where: { id: algorithmReportId },
    });

    if (!algorithmReport) {
      return errorResponse('原报告不存在', ErrorCodes.NOT_FOUND, 404);
    }

    // 验证原报告是否为算法版
    if (!algorithmReport.fullContent?.includes('纯算法解读')) {
      return errorResponse('只能升级算法版报告', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 查询兑换码
    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode },
    });

    // 验证兑换码
    if (!voucher || voucher.isUsed) {
      return errorResponse('兑换码无效或已被使用', ErrorCodes.VALIDATION_ERROR, 400);
    }

    console.log(`✅ 兑换码有效: ${voucherCode}`);

    // 创建新的AI版报告（待激活状态）
    const fullContent = '待激活';
    const basicSummary = `您好 ${algorithmReport.name}，

您的八字为：
年柱：${algorithmReport.baziYear}
月柱：${algorithmReport.baziMonth}
日柱：${algorithmReport.baziDay}
时柱：${algorithmReport.baziHour}

五行分析：${algorithmReport.wuxing ? JSON.parse(algorithmReport.wuxing).dominant : ''}特征明显

报告待激活，请确认信息后激活。`;

    const newReport = await prisma.report.create({
      data: {
        title: `${algorithmReport.name}的八字命理分析报告（AI深度版）`,
        basicSummary,
        fullContent,
        status: 'draft',
        name: algorithmReport.name,
        gender: algorithmReport.gender,
        birthDate: algorithmReport.birthDate,
        birthTime: algorithmReport.birthTime,
        country: algorithmReport.country,
        city: algorithmReport.city,
        longitude: algorithmReport.longitude,
        latitude: algorithmReport.latitude,
        baziYear: algorithmReport.baziYear,
        baziMonth: algorithmReport.baziMonth,
        baziDay: algorithmReport.baziDay,
        baziHour: algorithmReport.baziHour,
        trueSolarTime: algorithmReport.trueSolarTime,
        wuxing: algorithmReport.wuxing,
        formJson: algorithmReport.formJson,
      },
    });

    console.log(`📝 [升级报告] 新AI版报告已创建 ID: ${newReport.id}, 等待激活`);

    // 返回新报告ID和兑换码（用于后续激活）
    return successResponse({
      ...newReport,
      voucherStatus: 'valid',
      voucherCode: voucherCode,
      sourceReportId: algorithmReportId,
    }, 201);

  } catch (error: any) {
    console.error('❌ Error upgrading report:', error);
    return errorResponse(error.message || 'Failed to upgrade report', ErrorCodes.SERVER_ERROR, 500);
  }
}
