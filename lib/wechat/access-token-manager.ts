/**
 * 微信公众号access_token管理器
 *
 * 功能：
 * - 从数据库缓存读取access_token
 * - 过期前5分钟自动刷新
 * - 支持强制刷新
 */

import { prisma } from '@/lib/prisma';
import type { WechatAccessTokenResponse } from './types';

const WECHAT_MP_APPID = process.env.WECHAT_MP_APPID || '';
const WECHAT_MP_SECRET = process.env.WECHAT_MP_SECRET || '';

/**
 * 获取微信公众号access_token
 *
 * @param forceRefresh 是否强制刷新（默认false）
 * @returns access_token字符串
 */
export async function getAccessToken(forceRefresh: boolean = false): Promise<string> {
  if (!WECHAT_MP_APPID || !WECHAT_MP_SECRET) {
    throw new Error('微信公众号配置缺失：WECHAT_MP_APPID 或 WECHAT_MP_SECRET 未设置');
  }

  // 1. 如果不是强制刷新，先查询数据库缓存
  if (!forceRefresh) {
    const cached = await prisma.wechatAccessToken.findUnique({
      where: { appId: WECHAT_MP_APPID }
    });

    // 2. 如果未过期，直接返回
    if (cached && cached.expiresAt > new Date()) {
      console.log('使用缓存的access_token');
      return cached.accessToken;
    }
  }

  // 3. 调用微信API获取新token
  console.log('从微信API获取新access_token');
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_MP_APPID}&secret=${WECHAT_MP_SECRET}`;

  const response = await fetch(url);
  const data: WechatAccessTokenResponse = await response.json();

  if (data.errcode) {
    throw new Error(`获取access_token失败: [${data.errcode}] ${data.errmsg}`);
  }

  if (!data.access_token || !data.expires_in) {
    throw new Error('获取access_token失败: 响应数据不完整');
  }

  // 4. 计算过期时间（提前5分钟过期，避免临界情况）
  const expiresAt = new Date(Date.now() + (data.expires_in - 300) * 1000);

  // 5. 保存到数据库
  await prisma.wechatAccessToken.upsert({
    where: { appId: WECHAT_MP_APPID },
    update: {
      accessToken: data.access_token,
      expiresAt
    },
    create: {
      appId: WECHAT_MP_APPID,
      accessToken: data.access_token,
      expiresAt
    }
  });

  console.log(`access_token已更新，过期时间: ${expiresAt.toISOString()}`);

  return data.access_token;
}

/**
 * 强制刷新access_token
 *
 * 用于token失效时的重试场景
 */
export async function refreshAccessToken(): Promise<string> {
  return getAccessToken(true);
}
