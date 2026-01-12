import { NextRequest, NextResponse } from 'next/server';
const { formatCalendarData } = require('@/lib/calendar-utils.js');

// 择吉事项列表（按常用优先排序）
export const ZEJI_ITEMS = [
  // 常用/热门
  '嫁娶', '入宅', '移徙', '开市', '交易', '安床', '订盟', '纳采',
  // 商业工作
  '立券', '纳财', '出货财', '开仓', '进人口', '赴任',
  // 装修建造
  '动土', '修造', '上梁', '盖屋', '起基', '竖柱',
  // 生活日常
  '祭祀', '祈福', '沐浴', '理发', '扫舍', '裁衣', '会亲友', '出行',
  // 其他（按拼音排序）
  '安葬', '安门', '安香', '安机械', '补垣', 'break', '成服', '出火', '除服',
  '冠笄', '挂匾', '坏垣', '纳畜', '架马', '结网', '解除', '掘井', '开池',
  '开光', '开厕', '开渠', '开生坟', '启钻', '取渔', '破屋', '破土', '平治道涂',
  '栽种', '塞穴', '塑绘', '求嗣', '求医', '伐木', '放水', '畋猎', '拆卸',
  '断蚁', '定磉', '斋醮', '筑堤', '治病', '针灸', '整手足甲', '置产', '捕捉',
  '经络', '教牛马', '牧养', '立碑', '谢土', '修坟', '修门', '修饰垣墙', '移柩',
  '入殓', '入学', '造仓', '造畜稠', '造船', '作梁', '作灶',
];

interface ZejiSearchParams {
  item: string; // 择吉事项
  startDate: string; // 起始日期 YYYY-MM-DD
  endDate: string; // 结束日期 YYYY-MM-DD
  offset?: number; // 偏移量（已加载的天数）
  limit?: number; // 每次加载的天数（默认30）
}

interface ZejiResult {
  date: string; // YYYY-MM-DD
  solar: {
    year: number;
    month: number;
    day: number;
    weekday: string;
  };
  lunar: {
    monthDay: string; // 农历月日，如"冬月廿三"
    ganZhi: string; // 流年流月流日
  };
  zhiShen: string; // 值神
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const item = searchParams.get('item');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '30');

    // 参数验证
    if (!item || !startDate || !endDate) {
      return NextResponse.json(
        { error: '缺少必要参数：item, startDate, endDate' },
        { status: 400 }
      );
    }

    // 验证事项是否有效
    if (!ZEJI_ITEMS.includes(item)) {
      return NextResponse.json(
        { error: '无效的择吉事项' },
        { status: 400 }
      );
    }

    // 解析日期
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: '日期格式错误' },
        { status: 400 }
      );
    }

    // 验证日期范围（最多1年）
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return NextResponse.json(
        { error: '日期范围不能超过1年' },
        { status: 400 }
      );
    }

    if (daysDiff < 0) {
      return NextResponse.json(
        { error: '结束日期不能早于开始日期' },
        { status: 400 }
      );
    }

    // 计算实际搜索的日期范围（考虑offset和limit）
    const searchStart = new Date(start);
    searchStart.setDate(searchStart.getDate() + offset);

    const searchEnd = new Date(searchStart);
    searchEnd.setDate(searchEnd.getDate() + limit - 1);

    // 不能超过用户指定的结束日期
    if (searchEnd > end) {
      searchEnd.setTime(end.getTime());
    }

    // 搜索符合条件的日期
    const results: ZejiResult[] = [];
    const currentDate = new Date(searchStart);

    while (currentDate <= searchEnd) {
      // 使用本地时间格式化日期，避免UTC时区问题
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      try {
        // 获取当天的黄历数据
        const targetDate = new Date(year, month - 1, day);
        const calendarData = formatCalendarData(targetDate);
        const yi = calendarData.yiJi.yi;

        // 检查是否包含"诸事不宜"或"馀事勿取"
        const hasUnfavorable = yi.includes('诸事不宜') || yi.includes('馀事勿取');

        // 检查是否包含目标事项
        const hasTargetItem = yi.includes(item);

        // 如果不包含不利项，且包含目标事项，则添加到结果
        if (!hasUnfavorable && hasTargetItem) {
          results.push({
            date: dateStr,
            solar: {
              year: calendarData.solar.year,
              month: calendarData.solar.month,
              day: calendarData.solar.day,
              weekday: calendarData.solar.weekday,
            },
            lunar: {
              monthDay: calendarData.lunar.monthDay,
              ganZhi: calendarData.ganZhi.full,
            },
            zhiShen: calendarData.zhiRiXingShen.shenSha,
          });
        }
      } catch (error) {
        console.error(`计算日期 ${dateStr} 的黄历数据失败:`, error);
      }

      // 移动到下一天
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 计算是否还有更多数据
    const hasMore = searchEnd < end;

    return NextResponse.json({
      success: true,
      data: {
        item,
        results,
        hasMore,
        nextOffset: offset + limit,
      },
    });
  } catch (error) {
    console.error('择吉搜索失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 获取所有择吉事项列表
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        items: ZEJI_ITEMS,
      },
    });
  } catch (error) {
    console.error('获取择吉事项列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
