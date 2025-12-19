import { NextResponse } from 'next/server';

/**
 * 诊断接口：检查微信配置
 * GET /api/test/wechat-config
 */
export async function GET() {
  const config = {
    WECHAT_APPID: process.env.WECHAT_APPID || '',
    WECHAT_SECRET: process.env.WECHAT_SECRET || '',
    hasAppId: !!process.env.WECHAT_APPID,
    hasSecret: !!process.env.WECHAT_SECRET,
    appIdLength: (process.env.WECHAT_APPID || '').length,
    secretLength: (process.env.WECHAT_SECRET || '').length,
    appIdPreview: (process.env.WECHAT_APPID || '').substring(0, 8) + '...',
    secretPreview: (process.env.WECHAT_SECRET || '').substring(0, 8) + '...',
  };

  return NextResponse.json({
    success: true,
    message: '微信配置检查',
    data: config
  });
}
