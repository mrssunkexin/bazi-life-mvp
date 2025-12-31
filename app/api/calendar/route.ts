/**
 * 黄历 API 接口
 * GET /api/calendar?date=2025-12-27
 */

import { NextRequest, NextResponse } from 'next/server';
// 使用 JavaScript 版本的工具函数（因为 lunar-javascript 是 CommonJS 模块）
const { formatCalendarData, getCalendarByDateString } = require('@/lib/calendar-utils.js');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    let calendarData;

    if (dateParam) {
      // 验证日期格式
      const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
      if (!dateRegex.test(dateParam)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_FORMAT',
              message: '日期格式错误，应为 YYYY-MM-DD',
            },
          },
          { status: 400 }
        );
      }

      // 验证日期有效性
      try {
        calendarData = getCalendarByDateString(dateParam);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DATE',
              message: '日期无效或超出支持范围',
            },
          },
          { status: 400 }
        );
      }
    } else {
      // 默认返回今天的黄历
      calendarData = formatCalendarData();
    }

    return NextResponse.json({
      success: true,
      data: calendarData,
    });
  } catch (error) {
    console.error('黄历 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
