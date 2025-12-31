/**
 * 黄历工具函数
 * 基于 lunar-javascript 库封装黄历计算逻辑
 */

// @ts-ignore
import * as LunarLib from 'lunar-javascript';
const { Solar, Lunar } = LunarLib;

/**
 * 黄历数据接口定义
 */
export interface CalendarData {
  solar: {
    year: number;
    month: number;
    day: number;
    weekday: string;
    week: number;
  };
  lunar: {
    date: string;
    month: string;
    day: string;
    year: string;
    zodiac: string;
  };
  ganZhi: {
    year: string;
    month: string;
    day: string;
  };
  wuxing: {
    year: string;
    month: string;
    day: string;
  };
  jieQi: {
    prev: {
      name: string;
      time: string;
    };
    next: {
      name: string;
      time: string;
    };
  };
  jieQiTag: {
    type: string;
    name: string;
    display: boolean;
  } | null;
  festival: {
    lunar: string[];
    nextLunarFestival: {
      name: string;
      daysLeft: number;
    } | null;
  };
  yiJi: {
    yi: string[];
    ji: string[];
  };
  chongSha: {
    chong: string;
    sha: string;
    full: string;
  };
  zhiRiXingShen: {
    name: string;
    type: string;
    jiXiong: string;
  };
  jiShenFangWei: {
    caiShen: string;
    xiShen: string;
    fuShen: string;
    yangGuiShen: string;
    yinGuiShen: string;
  };
  shiChen: Array<{
    name: string;
    time: string;
    ganZhi: string;
    jiXiong: string;
  }>;
}

/**
 * 计算数九或三伏节令标签
 */
function calculateJieQiTag(lunar: Lunar): {
  type: string;
  name: string;
  display: boolean;
} | null {
  // 检查数九
  const shuJiu = lunar.getShuJiu();
  if (shuJiu) {
    return {
      type: '数九',
      name: shuJiu.toString(),
      display: true,
    };
  }

  // 检查三伏
  const fu = lunar.getFu();
  if (fu) {
    return {
      type: '三伏',
      name: fu.toString(),
      display: true,
    };
  }

  return null;
}

/**
 * 查找下一个农历节日
 */
function findNextLunarFestival(currentSolar: Solar): {
  name: string;
  daysLeft: number;
} | null {
  // 主要农历节日列表（按农历月日）
  const lunarFestivals = [
    { month: 1, day: 1, name: '春节' },
    { month: 1, day: 15, name: '元宵节' },
    { month: 2, day: 2, name: '龙抬头' },
    { month: 5, day: 5, name: '端午节' },
    { month: 7, day: 7, name: '七夕节' },
    { month: 7, day: 15, name: '中元节' },
    { month: 8, day: 15, name: '中秋节' },
    { month: 9, day: 9, name: '重阳节' },
    { month: 10, day: 1, name: '寒衣节' },
    { month: 10, day: 15, name: '下元节' },
    { month: 12, day: 8, name: '腊八节' },
    { month: 12, day: 23, name: '小年' },
  ];

  const currentLunar = currentSolar.getLunar();
  const currentYear = currentLunar.getYear();
  const currentMonth = currentLunar.getMonth();
  const currentDay = currentLunar.getDay();

  let nearestFestival: { name: string; daysLeft: number } | null = null;
  let minDays = Infinity;

  // 查找当年和明年的节日
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    for (const festival of lunarFestivals) {
      try {
        // 创建节日的农历日期
        const festivalLunar = Lunar.fromYmd(
          currentYear + yearOffset,
          festival.month,
          festival.day
        );
        const festivalSolar = festivalLunar.getSolar();

        // 计算距离天数
        const days = festivalSolar.subtract(currentSolar);

        // 只考虑未来的节日
        if (days > 0 && days < minDays) {
          minDays = days;
          nearestFestival = {
            name: festival.name,
            daysLeft: days,
          };
        }
      } catch (error) {
        // 忽略无效日期（如闰月处理）
        continue;
      }
    }

    // 如果找到了节日，不再查找明年
    if (nearestFestival) {
      break;
    }
  }

  return nearestFestival;
}

/**
 * 获取值日星神的吉凶
 */
function getZhiXingJiXiong(zhiXing: string): string {
  // 黄道吉日：建、除、满、平、定、执、成、开
  // 黑道凶日：破、危、收、闭
  const huangDao = ['建', '除', '满', '平', '定', '执', '成', '开'];
  const heiDao = ['破', '危', '收', '闭'];

  if (huangDao.includes(zhiXing)) {
    return '吉';
  } else if (heiDao.includes(zhiXing)) {
    return '凶';
  } else {
    return '平';
  }
}

/**
 * 判断时辰吉凶
 */
function getShiChenJiXiong(yi: string[], ji: string[]): string {
  // 如果忌中包含"诸事不宜"，则为凶
  if (ji.includes('诸事不宜')) {
    return '凶';
  }

  // 如果宜的项目多于忌，则为吉
  if (yi.length > ji.length) {
    return '吉';
  } else if (yi.length < ji.length) {
    return '凶';
  } else {
    return '平';
  }
}

/**
 * 获取时辰名称和时间范围
 */
function getShiChenTimeRange(index: number): { name: string; time: string } {
  const shiChenMap = [
    { name: '子时', time: '23:00-00:59' },
    { name: '丑时', time: '01:00-02:59' },
    { name: '寅时', time: '03:00-04:59' },
    { name: '卯时', time: '05:00-06:59' },
    { name: '辰时', time: '07:00-08:59' },
    { name: '巳时', time: '09:00-10:59' },
    { name: '午时', time: '11:00-12:59' },
    { name: '未时', time: '13:00-14:59' },
    { name: '申时', time: '15:00-16:59' },
    { name: '酉时', time: '17:00-18:59' },
    { name: '戌时', time: '19:00-20:59' },
    { name: '亥时', time: '21:00-22:59' },
  ];

  return shiChenMap[index];
}

/**
 * 格式化黄历数据
 */
export function formatCalendarData(date?: Date): CalendarData {
  const targetDate = date || new Date();

  // 创建公历对象
  const solar = Solar.fromDate(targetDate);
  const lunar = solar.getLunar();

  // 获取节气信息
  const prevJieQi = lunar.getPrevJieQi(true);
  const nextJieQi = lunar.getNextJieQi(true);

  // 获取节令标签
  const jieQiTag = calculateJieQiTag(lunar);

  // 获取节日信息
  const festivals = [...lunar.getFestivals(), ...lunar.getOtherFestivals()];
  const nextLunarFestival = findNextLunarFestival(solar);

  // 获取值日星神
  const zhiXing = lunar.getZhiXing();
  const zhiXingJiXiong = getZhiXingJiXiong(zhiXing);
  const zhiXingType = zhiXingJiXiong === '吉' ? '黄道' : '黑道';

  // 获取时辰信息
  const times = lunar.getTimes();
  const shiChen = times.map((time, index) => {
    const yi = time.getYi();
    const ji = time.getJi();
    const jiXiong = getShiChenJiXiong(yi, ji);
    const { name, time: timeRange } = getShiChenTimeRange(index);

    return {
      name,
      time: timeRange,
      ganZhi: time.getGanZhi(),
      jiXiong,
    };
  });

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      weekday: solar.getWeekInChinese(),
      week: solar.getWeek(),
    },
    lunar: {
      date: lunar.toString(),
      month: lunar.getMonthInChinese(),
      day: lunar.getDayInChinese(),
      year: lunar.getYearInGanZhi() + '年',
      zodiac: lunar.getYearShengXiao(),
    },
    ganZhi: {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
    },
    wuxing: {
      year: lunar.getYearNaYin(),
      month: lunar.getMonthNaYin(),
      day: lunar.getDayNaYin(),
    },
    jieQi: {
      prev: {
        name: prevJieQi.getName(),
        time: prevJieQi.getSolar().toYmdHms(),
      },
      next: {
        name: nextJieQi.getName(),
        time: nextJieQi.getSolar().toYmdHms(),
      },
    },
    jieQiTag,
    festival: {
      lunar: festivals,
      nextLunarFestival,
    },
    yiJi: {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
    },
    chongSha: {
      chong: lunar.getDayChongDesc(),
      sha: lunar.getDaySha(),
      full: `冲${lunar.getDayChongDesc()} ${lunar.getDaySha()}`,
    },
    zhiRiXingShen: {
      name: zhiXing,
      type: zhiXingType,
      jiXiong: zhiXingJiXiong,
    },
    jiShenFangWei: {
      caiShen: lunar.getDayPositionCai(),
      xiShen: lunar.getDayPositionXi(),
      fuShen: lunar.getDayPositionFu(),
      yangGuiShen: lunar.getDayPositionYangGui(),
      yinGuiShen: lunar.getDayPositionYinGui(),
    },
    shiChen,
  };
}

/**
 * 根据日期字符串获取黄历数据
 */
export function getCalendarByDateString(dateStr: string): CalendarData {
  const [year, month, day] = dateStr.split('-').map(Number);
  // 直接使用 JavaScript Date 对象
  const targetDate = new Date(year, month - 1, day);
  return formatCalendarData(targetDate);
}
