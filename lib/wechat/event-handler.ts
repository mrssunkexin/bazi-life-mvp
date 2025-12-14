/**
 * 微信公众号事件处理器
 *
 * 功能：
 * - 处理用户关注事件
 * - 处理用户取消关注事件
 * - 通过unionid关联小程序用户
 * - 更新mpOpenid和subscribeStatus
 */

import { prisma } from '@/lib/prisma';
import { getAccessToken } from './access-token-manager';
import type { WechatEventMessage, WechatUserInfoResponse } from './types';

/**
 * 处理用户关注事件
 *
 * @param message 事件消息
 */
export async function handleSubscribeEvent(message: WechatEventMessage): Promise<void> {
  const mpOpenid = message.FromUserName;

  console.log('📢 收到用户关注事件, mpOpenid:', mpOpenid);

  try {
    // 1. 调用微信API获取用户信息（含unionid）
    const userInfo = await getUserInfo(mpOpenid);

    if (!userInfo.unionid) {
      console.log('⚠️ 用户未绑定开放平台，无法关联小程序账号');
      return;
    }

    console.log('✅ 获取到用户unionid:', userInfo.unionid);

    // 2. 通过unionid查找用户
    const user = await prisma.user.findUnique({
      where: { unionid: userInfo.unionid }
    });

    if (!user) {
      console.log('⚠️ 未找到对应的小程序用户，可能用户尚未登录小程序');
      return;
    }

    // 3. 更新mpOpenid和subscribeStatus
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mpOpenid,
        subscribeStatus: true
      }
    });

    console.log(`✅ 用户绑定成功: userId=${user.id}, nickname=${user.nickname || '未授权'}`);
  } catch (error) {
    console.error('❌ 处理关注事件失败:', error);
  }
}

/**
 * 处理用户取消关注事件
 *
 * @param message 事件消息
 */
export async function handleUnsubscribeEvent(message: WechatEventMessage): Promise<void> {
  const mpOpenid = message.FromUserName;

  console.log('📢 收到用户取消关注事件, mpOpenid:', mpOpenid);

  try {
    // 更新subscribeStatus为false
    const result = await prisma.user.updateMany({
      where: { mpOpenid },
      data: { subscribeStatus: false }
    });

    console.log(`✅ 已更新 ${result.count} 个用户的关注状态为false`);
  } catch (error) {
    console.error('❌ 处理取消关注事件失败:', error);
  }
}

/**
 * 获取微信用户信息
 *
 * @param mpOpenid 公众号openid
 * @returns 用户信息
 */
async function getUserInfo(mpOpenid: string): Promise<WechatUserInfoResponse> {
  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${mpOpenid}&lang=zh_CN`;

  const response = await fetch(url);
  const data: WechatUserInfoResponse = await response.json();

  if (data.errcode) {
    throw new Error(`获取用户信息失败: [${data.errcode}] ${data.errmsg}`);
  }

  return data;
}
