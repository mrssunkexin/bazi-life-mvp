import { NextResponse } from 'next/server';

/**
 * 网络诊断接口：测试是否能访问微信API
 * GET /api/test/network-test
 */
export async function GET() {
  const testUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=test&secret=test';

  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };

  // 测试1：DNS解析
  try {
    const dnsTest = await fetch('https://api.weixin.qq.com/', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    results.tests.push({
      name: 'DNS解析测试',
      status: 'success',
      details: `HTTP ${dnsTest.status}`
    });
  } catch (error: any) {
    results.tests.push({
      name: 'DNS解析测试',
      status: 'failed',
      error: error.message
    });
  }

  // 测试2：完整API调用
  try {
    const apiTest = await fetch(testUrl, {
      signal: AbortSignal.timeout(5000)
    });
    const data = await apiTest.json();
    results.tests.push({
      name: '微信API调用测试',
      status: 'success',
      httpStatus: apiTest.status,
      response: data
    });
  } catch (error: any) {
    results.tests.push({
      name: '微信API调用测试',
      status: 'failed',
      error: error.message,
      errorName: error.name
    });
  }

  // 测试3：环境信息
  results.tests.push({
    name: '环境信息',
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      hasWechatAppId: !!process.env.WECHAT_APPID,
      hasWechatSecret: !!process.env.WECHAT_SECRET
    }
  });

  return NextResponse.json({
    success: true,
    message: '网络诊断完成',
    data: results
  });
}
