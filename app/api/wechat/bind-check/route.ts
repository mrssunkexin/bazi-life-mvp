/**
 * 检查用户绑定状态接口
 *
 * 供小程序调用，检查用户是否关注公众号
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - 检查用户绑定状态
 *
 * @param userId 用户ID
 * @returns 绑定状态信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少userId参数'
        },
        { status: 400 }
      );
    }

    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mpOpenid: true,
        subscribeStatus: true,
        unionid: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isSubscribed: user.subscribeStatus || false,
        isBound: !!user.mpOpenid,
        hasUnionId: !!user.unionid
      }
    });
  } catch (error) {
    console.error('❌ 查询绑定状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器错误'
      },
      { status: 500 }
    );
  }
}
