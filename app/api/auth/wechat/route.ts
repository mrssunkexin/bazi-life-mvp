import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

/**
 * 微信登录接口
 * POST /api/auth/wechat
 * 接收小程序code，换取openid和unionid，创建或更新用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, nickname, avatarUrl } = body;

    // 验证必填参数
    if (!code) {
      return errorResponse('缺少code参数', ErrorCodes.VALIDATION_ERROR, 400);
    }

    // 调用微信API换取openid
    const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

    console.log('🔐 调用微信登录API...');
    console.log('📡 请求URL:', wxApiUrl.replace(WECHAT_SECRET, '***'));

    let wxResponse;
    let wxData;

    try {
      wxResponse = await fetch(wxApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 微信API响应状态:', wxResponse.status, wxResponse.statusText);

      wxData = await wxResponse.json();
      console.log('📦 微信API响应数据:', wxData);

    } catch (fetchError: any) {
      console.error('❌ 网络请求失败:', fetchError);
      console.error('❌ 错误详情:', {
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack?.split('\n').slice(0, 3)
      });

      return errorResponse(
        '网络连接失败，云托管服务无法访问微信API。请检查服务配置或联系管理员。',
        ErrorCodes.SERVER_ERROR,
        500
      );
    }

    // 检查微信API返回
    if (wxData.errcode) {
      console.error('❌ 微信API错误:', wxData);
      return errorResponse(
        `微信登录失败: ${wxData.errmsg}`,
        ErrorCodes.SERVER_ERROR,
        500
      );
    }

    const { openid, unionid, session_key } = wxData;

    if (!openid) {
      return errorResponse('获取openid失败', ErrorCodes.SERVER_ERROR, 500);
    }

    console.log('✅ 获取openid成功:', openid);
    console.log('📋 unionid:', unionid || '无（需绑定开放平台）');

    // 使用upsert原子操作，避免并发竞争条件
    const updateData: any = {};

    // 如果提供了昵称和头像，则更新
    if (nickname && avatarUrl) {
      updateData.nickname = nickname;
      updateData.avatarUrl = avatarUrl;
      updateData.hasAuthorized = true;
    }

    // 如果提供了unionid，则更新（不会覆盖已有的unionid）
    if (unionid) {
      updateData.unionid = unionid;
    }

    const user = await prisma.user.upsert({
      where: { openid },
      update: updateData,
      create: {
        openid,
        unionid: unionid || null,
        nickname: nickname || null,
        avatarUrl: avatarUrl || null,
        hasAuthorized: !!(nickname && avatarUrl)
      }
    });

    console.log(updateData.nickname ? '🔄 更新用户信息:' : '🆕 创建或获取用户:', user.id);

    return successResponse({
      userId: user.id,
      openid: user.openid,
      hasAuthorized: user.hasAuthorized,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl
    });

  } catch (error: any) {
    console.error('❌ 微信登录失败:', error);
    return errorResponse(
      error.message || '登录失败',
      ErrorCodes.SERVER_ERROR,
      500
    );
  }
}
