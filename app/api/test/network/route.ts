import { NextRequest, NextResponse } from 'next/server';

/**
 * 网络诊断接口
 * 测试云托管是否能访问外网
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // 测试1: 访问微信API
  try {
    const wxUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=test&secret=test';
    const startTime = Date.now();
    const wxResponse = await fetch(wxUrl);
    const wxData = await wxResponse.json();
    const elapsed = Date.now() - startTime;

    results.tests.push({
      name: '微信API访问',
      url: wxUrl,
      success: true,
      elapsed: `${elapsed}ms`,
      response: wxData
    });
  } catch (error: any) {
    results.tests.push({
      name: '微信API访问',
      success: false,
      error: error.message
    });
  }

  // 测试2: 访问百度
  try {
    const baiduUrl = 'https://www.baidu.com';
    const startTime = Date.now();
    const baiduResponse = await fetch(baiduUrl);
    const elapsed = Date.now() - startTime;

    results.tests.push({
      name: '百度访问',
      url: baiduUrl,
      success: true,
      elapsed: `${elapsed}ms`,
      statusCode: baiduResponse.status
    });
  } catch (error: any) {
    results.tests.push({
      name: '百度访问',
      success: false,
      error: error.message
    });
  }

  // 测试3: DNS解析
  try {
    const dnsUrl = 'https://1.1.1.1';
    const startTime = Date.now();
    const dnsResponse = await fetch(dnsUrl, { method: 'HEAD' });
    const elapsed = Date.now() - startTime;

    results.tests.push({
      name: 'DNS解析（1.1.1.1）',
      url: dnsUrl,
      success: true,
      elapsed: `${elapsed}ms`,
      statusCode: dnsResponse.status
    });
  } catch (error: any) {
    results.tests.push({
      name: 'DNS解析',
      success: false,
      error: error.message
    });
  }

  // 汇总结果
  const successCount = results.tests.filter((t: any) => t.success).length;
  const totalCount = results.tests.length;

  results.summary = {
    success: successCount,
    failed: totalCount - successCount,
    total: totalCount,
    hasInternetAccess: successCount > 0
  };

  return NextResponse.json(results, { status: 200 });
}
