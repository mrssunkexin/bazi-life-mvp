import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVoucherCodes } from '@/lib/voucher-utils';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

// POST - 批量生成兑换码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count } = body;

    // 验证参数
    if (!count || count < 1 || count > 1000) {
      return errorResponse('生成数量必须在 1-1000 之间', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 生成兑换码
    const codes = generateVoucherCodes(count, 30);

    // 批量插入数据库
    const vouchers = codes.map(code => ({
      code,
      isUsed: false,
    }));

    await prisma.voucher.createMany({
      data: vouchers,
    });

    // 查询刚创建的兑换码（返回完整信息）
    const createdVouchers = await prisma.voucher.findMany({
      where: {
        code: {
          in: codes,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ 成功生成 ${count} 个兑换码`);
    return successResponse(createdVouchers, 201);
  } catch (error: any) {
    console.error('❌ 生成兑换码失败:', error);
    return errorResponse(error.message || '生成兑换码失败', ErrorCodes.SERVER_ERROR, 500);
  }
}

// GET - 获取兑换码列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // unused, used, all

    // 构建查询条件
    const where: any = {};
    if (status === 'unused') {
      where.isUsed = false;
    } else if (status === 'used') {
      where.isUsed = true;
    }

    const vouchers = await prisma.voucher.findMany({
      where,
      include: {
        report: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 500, // 最多返回500条
    });

    return successResponse(vouchers);
  } catch (error: any) {
    console.error('❌ 获取兑换码列表失败:', error);
    return errorResponse(error.message || '获取兑换码列表失败', ErrorCodes.SERVER_ERROR, 500);
  }
}
