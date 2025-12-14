/**
 * 微信公众号相关类型定义
 */

/**
 * 微信access_token响应
 */
export interface WechatAccessTokenResponse {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信用户信息响应
 */
export interface WechatUserInfoResponse {
  subscribe?: number;
  openid?: string;
  unionid?: string;
  nickname?: string;
  sex?: number;
  language?: string;
  city?: string;
  province?: string;
  country?: string;
  headimgurl?: string;
  subscribe_time?: number;
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信事件消息
 */
export interface WechatEventMessage {
  ToUserName: string;
  FromUserName: string;
  CreateTime: string;
  MsgType: string;
  Event: string;
  EventKey?: string;
}

/**
 * 模板消息数据
 */
export interface TemplateMessageData {
  touser: string;
  template_id: string;
  miniprogram: {
    appid: string;
    pagepath: string;
  };
  data: {
    [key: string]: {
      value: string;
    };
  };
}

/**
 * 模板消息发送响应
 */
export interface TemplateMessageResponse {
  errcode: number;
  errmsg: string;
  msgid?: number;
}

/**
 * 模板消息发送参数
 */
export interface SendTemplateMessageParams {
  mpOpenid: string;
  reportId: string;
  reportType: 'basic' | 'fortune2026';
  userName: string;
  publishTime: Date;
}
