/**
 * 统一 API 响应格式工具
 * 为小程序提供标准化的响应格式
 */

import { NextResponse } from 'next/server';

// 错误码常量
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  GENERATION_ERROR: 'GENERATION_ERROR',
} as const;

// 成功响应类型
interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

// 错误响应类型
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

/**
 * 创建成功响应
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: string,
  code: string = ErrorCodes.SERVER_ERROR,
  status: number = 500
): NextResponse {
  const response: ErrorResponse = {
    success: false,
    error,
    code,
  };

  return NextResponse.json(response, { status });
}

/**
 * 包装异步处理器，自动处理错误
 */
export function wrapHandler<T>(
  handler: () => Promise<T>,
  errorCode: string = ErrorCodes.SERVER_ERROR
) {
  return async () => {
    try {
      const data = await handler();
      return successResponse(data);
    } catch (error: any) {
      console.error('API Error:', error);
      return errorResponse(
        error.message || '服务器错误',
        errorCode,
        500
      );
    }
  };
}
