/**
 * 微信公众号模板消息发送器
 *
 * 功能：
 * - 发送模板消息到公众号
 * - 自动重试（token失效时）
 * - 异常处理（不阻塞发布流程）
 */

import { getAccessToken, refreshAccessToken } from './access-token-manager';
import type { SendTemplateMessageParams, TemplateMessageData, TemplateMessageResponse } from './types';

const WECHAT_APPID = process.env.WECHAT_APPID || ''; // 小程序AppID
const TEMPLATE_ID = process.env.WECHAT_TEMPLATE_ID || '';

/**
 * 发送模板消息
 *
 * @param params 发送参数
 * @returns 是否发送成功
 */
export async function sendTemplateMessage(params: SendTemplateMessageParams): Promise<boolean> {
  const { mpOpenid, reportId, reportType, userName, publishTime } = params;

  if (!WECHAT_APPID || !TEMPLATE_ID) {
    console.error('模板消息配置缺失：WECHAT_APPID 或 WECHAT_TEMPLATE_ID 未设置');
    return false;
  }

  try {
    // 1. 获取access_token
    let accessToken = await getAccessToken();

    // 2. 构造消息数据
    const message: TemplateMessageData = {
      touser: mpOpenid,
      template_id: TEMPLATE_ID,
      miniprogram: {
        appid: WECHAT_APPID, // 跳转到小程序
        pagepath: `/pages/result/result?reportId=${reportId}&type=${reportType}`
      },
      data: {
        character_string8: { value: reportId }, // 订单编号
        thing10: { value: userName }, // 用户名称
        time16: { value: formatDateTime(publishTime) } // 完成时间
      }
    };

    console.log('📤 准备发送模板消息:', {
      touser: mpOpenid,
      reportId,
      reportType,
      userName
    });

    // 3. 发送请求
    let response = await sendMessageRequest(accessToken, message);

    // 4. 处理token失效情况（自动刷新重试）
    if (response.errcode === 40001 || response.errcode === 42001) {
      console.log('⚠️ access_token失效，刷新后重试');
      accessToken = await refreshAccessToken();
      response = await sendMessageRequest(accessToken, message);
    }

    // 5. 检查结果
    if (response.errcode === 0) {
      console.log('✅ 模板消息发送成功, msgid:', response.msgid);
      return true;
    } else {
      console.error('❌ 模板消息发送失败:', response.errcode, response.errmsg);
      return false;
    }
  } catch (error) {
    console.error('❌ 发送模板消息异常:', error);
    return false;
  }
}

/**
 * 发送消息请求（内部方法）
 */
async function sendMessageRequest(
  accessToken: string,
  message: TemplateMessageData
): Promise<TemplateMessageResponse> {
  const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  return await response.json();
}

/**
 * 格式化日期时间为模板要求的格式
 * @param date Date对象
 * @returns YYYY-MM-DD HH:mm:ss 格式字符串
 */
function formatDateTime(date: Date): string {
  return date.toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '');
}
