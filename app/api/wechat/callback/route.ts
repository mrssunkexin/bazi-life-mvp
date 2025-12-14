/**
 * 微信公众号事件回调接口
 *
 * GET: 微信服务器验证（接入配置时调用）
 * POST: 接收事件推送（关注/取消关注等）
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handleSubscribeEvent, handleUnsubscribeEvent } from '@/lib/wechat/event-handler';
import type { WechatEventMessage } from '@/lib/wechat/types';

const WECHAT_TOKEN = process.env.WECHAT_CALLBACK_TOKEN || '';

/**
 * GET - 微信服务器验证
 *
 * 用于公众号后台配置服务器URL时的验证
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get('signature') || '';
  const timestamp = searchParams.get('timestamp') || '';
  const nonce = searchParams.get('nonce') || '';
  const echostr = searchParams.get('echostr') || '';

  console.log('📝 收到微信服务器验证请求');

  if (!WECHAT_TOKEN) {
    console.error('❌ WECHAT_CALLBACK_TOKEN 未配置');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  // 验证签名
  if (checkSignature(signature, timestamp, nonce)) {
    console.log('✅ 签名验证成功，返回echostr');
    return new NextResponse(echostr);
  }

  console.error('❌ 签名验证失败');
  return new NextResponse('Invalid signature', { status: 403 });
}

/**
 * POST - 接收事件推送
 *
 * 处理用户关注、取消关注等事件
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature') || '';
    const timestamp = searchParams.get('timestamp') || '';
    const nonce = searchParams.get('nonce') || '';

    // 验证签名
    if (!checkSignature(signature, timestamp, nonce)) {
      console.error('❌ 签名验证失败');
      return new NextResponse('Invalid signature', { status: 403 });
    }

    // 读取XML消息体
    const body = await request.text();
    console.log('📨 收到微信事件推送:', body.substring(0, 200));

    // 解析XML
    const message = parseXML(body);

    // 处理事件
    if (message.MsgType === 'event') {
      if (message.Event === 'subscribe') {
        // 关注事件
        await handleSubscribeEvent(message);
      } else if (message.Event === 'unsubscribe') {
        // 取消关注事件
        await handleUnsubscribeEvent(message);
      }
    }

    // 必须返回success，否则微信会重试
    return new NextResponse('success');
  } catch (error) {
    console.error('❌ 处理微信事件失败:', error);
    // 即使出错也返回success，避免微信重试
    return new NextResponse('success');
  }
}

/**
 * 校验微信签名
 *
 * @param signature 微信传递的签名
 * @param timestamp 时间戳
 * @param nonce 随机数
 * @returns 是否验证通过
 */
function checkSignature(signature: string, timestamp: string, nonce: string): boolean {
  const arr = [WECHAT_TOKEN, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  return sha1 === signature;
}

/**
 * 解析XML消息（简单正则实现，无需第三方库）
 *
 * @param xml XML字符串
 * @returns 解析后的消息对象
 */
function parseXML(xml: string): WechatEventMessage {
  const getValue = (tag: string): string => {
    const regex = new RegExp(`<${tag}><!\\[CDATA\\[(.+?)\\]\\]></${tag}>`);
    const match = xml.match(regex);
    if (match) return match[1];

    // 处理非CDATA格式
    const simpleRegex = new RegExp(`<${tag}>(.+?)</${tag}>`);
    const simpleMatch = xml.match(simpleRegex);
    return simpleMatch ? simpleMatch[1] : '';
  };

  return {
    ToUserName: getValue('ToUserName'),
    FromUserName: getValue('FromUserName'),
    CreateTime: getValue('CreateTime'),
    MsgType: getValue('MsgType'),
    Event: getValue('Event'),
    EventKey: getValue('EventKey') || undefined
  };
}
