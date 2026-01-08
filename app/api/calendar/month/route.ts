/**
 * 月份黄历批量 API 接口
 * GET /api/calendar/month?year=2026&month=1
 */

import { NextRequest, NextResponse } from 'next/server';
const { getCalendarByDateString } = require('@/lib/calendar-utils.js');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    // 默认使用当前年月
    const now = new Date();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;

    // 验证参数
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: '年份或月份参数无效',
          },
        },
        { status: 400 }
      );
    }

    // 生成该月所有日期
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${month}-${day}`;
      try {
        const dayData = getCalendarByDateString(dateString);
        monthData.push({
          date: dateString,
          ...dayData,
        });
      } catch (error) {
        console.error(`获取日期 ${dateString} 失败:`, error);
        // 如果某天获取失败，继续处理其他日期
        continue;
      }
    }

    // 获取流月天干（使用该月第一天的数据）
    const firstDayData = monthData[0];
    const liuyueTiangan = firstDayData?.ganZhi?.month || '';

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        liuyueTiangan, // 流月天干，用于计算整月背景色
        days: monthData,
      },
    });
  } catch (error) {
    console.error('月份黄历 API 错误:', error);
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
