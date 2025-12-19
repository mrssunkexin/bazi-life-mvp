/**
 * 微信云开发内部调用
 * 用于在云托管环境中调用微信 API（无需访问外网）
 */

const CLOUD_API_BASE = 'http://api.weixin.qq.com'; // 云托管内网域名

interface WechatLoginResult {
  openid: string;
  unionid?: string;
  session_key: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 通过 code 获取 openid（云托管环境专用）
 * 使用云托管提供的内网 API，无需访问公网
 */
export async function code2Session(
  code: string,
  appid: string,
  secret: string
): Promise<WechatLoginResult> {
  const url = `${CLOUD_API_BASE}/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

  console.log('🔐 使用云托管内网调用微信API...');
  console.log('📡 请求URL:', url.replace(secret, '***'));

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 微信API响应状态:', response.status);

    const data = await response.json();
    console.log('📦 微信API响应数据:', data);

    return data;
  } catch (error: any) {
    console.error('❌ 云托管内网API调用失败:', error);
    throw new Error(`微信登录失败: ${error.message}`);
  }
}
