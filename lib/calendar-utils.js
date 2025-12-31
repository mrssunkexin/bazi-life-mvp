/**
 * 黄历工具函数
 * 基于 lunar-javascript 库封装黄历计算逻辑
 */

const { Solar, Lunar } = require('lunar-javascript');

/**
 * 计算数九或三伏节令标签
 */
function calculateJieQiTag(lunar) {
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
 * 计算距离春节的天数
 */
function getDaysToSpringFestival(currentSolar) {
  const currentLunar = currentSolar.getLunar();
  const currentYear = currentLunar.getYear();

  // 尝试当年的春节（正月初一）
  try {
    const springFestivalLunar = Lunar.fromYmd(currentYear, 1, 1);
    const springFestivalSolar = springFestivalLunar.getSolar();
    const days = springFestivalSolar.subtract(currentSolar);

    if (days > 0) {
      return days;
    }
  } catch (error) {
    // 忽略错误
  }

  // 如果当年春节已过，计算明年春节
  try {
    const nextSpringFestivalLunar = Lunar.fromYmd(currentYear + 1, 1, 1);
    const nextSpringFestivalSolar = nextSpringFestivalLunar.getSolar();
    const days = nextSpringFestivalSolar.subtract(currentSolar);
    return days > 0 ? days : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * 获取值日星神的吉凶
 */
function getZhiXingJiXiong(zhiXing) {
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
 * 地支藏干对照表
 */
const DIZHI_CANGGAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

/**
 * 天干五行属性
 */
const TIANGAN_WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/**
 * 地支五行属性
 */
const DIZHI_WUXING = {
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
};

/**
 * 获取地支藏干及其百分比
 * @param {string} dizhi - 地支
 * @returns {Array} - [{gan: '甲', percent: 60}, ...]
 */
function getDizhiCangGan(dizhi) {
  const cangGan = DIZHI_CANGGAN[dizhi] || [];
  const count = cangGan.length;

  if (count === 1) {
    return [{ gan: cangGan[0], percent: 100, type: 'main' }];
  } else if (count === 2) {
    return [
      { gan: cangGan[0], percent: 70, type: 'main' },
      { gan: cangGan[1], percent: 30, type: 'zhong' },
    ];
  } else if (count === 3) {
    return [
      { gan: cangGan[0], percent: 60, type: 'main' },
      { gan: cangGan[1], percent: 30, type: 'zhong' },
      { gan: cangGan[2], percent: 10, type: 'yu' },
    ];
  }

  return [];
}

/**
 * 根据日干推算时辰天干
 * 口诀：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
 * @param {string} dayGan - 日干
 * @param {number} shiChenIndex - 时辰索引 (0=子时, 1=丑时, ...)
 * @returns {string} - 时辰天干
 */
function getShiChenGan(dayGan, shiChenIndex) {
  const ganList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 根据日干确定子时的天干起点
  const dayGanIndex = {
    '甲': 0, '己': 0,  // 甲己日从甲子时开始
    '乙': 2, '庚': 2,  // 乙庚日从丙子时开始
    '丙': 4, '辛': 4,  // 丙辛日从戊子时开始
    '丁': 6, '壬': 6,  // 丁壬日从庚子时开始
    '戊': 8, '癸': 8,  // 戊癸日从壬子时开始
  };

  const startGanIndex = dayGanIndex[dayGan];
  const shiChenGanIndex = (startGanIndex + shiChenIndex) % 10;

  return ganList[shiChenGanIndex];
}

/**
 * 五行中文到拼音的映射
 */
const WUXING_PINYIN = {
  '金': 'jin',
  '木': 'mu',
  '水': 'shui',
  '火': 'huo',
  '土': 'tu',
};

/**
 * 获取天干或地支的五行属性
 * @param {string} gan - 天干或地支
 * @param {boolean} pinyin - 是否返回拼音（默认返回中文）
 * @returns {string} - 五行属性
 */
function getWuxing(gan, pinyin = false) {
  const wuxing = TIANGAN_WUXING[gan] || DIZHI_WUXING[gan] || '';
  if (pinyin && wuxing) {
    return WUXING_PINYIN[wuxing] || wuxing;
  }
  return wuxing;
}

/**
 * 判断时辰吉凶（使用天神吉凶判断）
 */
function getShiChenJiXiong(lunarTime) {
  // 使用lunar-javascript的天神吉凶判断
  const luck = lunarTime.getTianShenLuck();
  return luck === '吉' ? '吉' : (luck === '凶' ? '凶' : '平');
}

/**
 * 获取时辰名称和时间范围
 */
function getShiChenTimeRange(index) {
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
 * 计算全年第几周（ISO 8601标准）
 */
function getWeekOfYear(solar) {
  const year = solar.getYear();
  const month = solar.getMonth();
  const day = solar.getDay();

  // 创建当前日期
  const currentDate = new Date(year, month - 1, day);

  // 获取1月1日
  const startOfYear = new Date(year, 0, 1);

  // 计算从年初到当前日期的天数
  const daysSinceStart = Math.floor((currentDate - startOfYear) / (24 * 60 * 60 * 1000));

  // 获取1月1日是星期几（0=周日，1=周一，...，6=周六）
  const startDayOfWeek = startOfYear.getDay();

  // 计算周数（ISO 8601：周一为一周的第一天）
  // 如果1月1日不是周一，则第一周从第一个周一开始
  const adjustedDays = daysSinceStart + (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1);
  const weekNumber = Math.floor(adjustedDays / 7) + 1;

  return weekNumber;
}

/**
 * 八卦方位转东南西北
 */
function baguaToDirection(bagua) {
  const directionMap = {
    '震': '东',
    '巽': '东南',
    '离': '南',
    '坤': '西南',
    '兑': '西',
    '乾': '西北',
    '坎': '北',
    '艮': '东北',
  };
  return directionMap[bagua] || bagua;
}

/**
 * 格式化黄历数据
 */
function formatCalendarData(date) {
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
  const daysToSpringFestival = getDaysToSpringFestival(solar);

  // 获取值日星神
  const zhiXing = lunar.getZhiXing();
  const zhiXingJiXiong = getZhiXingJiXiong(zhiXing);
  const zhiXingType = zhiXingJiXiong === '吉' ? '黄道' : '黑道';

  // 获取日干支
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();

  // 计算流日的五行能量（日地支的藏干）
  const dayZhiCangGan = getDizhiCangGan(dayZhi);
  const liuriWuxing = {
    dayGan,
    dayZhi,
    dayGanWuxing: getWuxing(dayGan),
    dayGanWuxingPinyin: getWuxing(dayGan, true),
    dayZhiWuxing: getWuxing(dayZhi),
    dayZhiWuxingPinyin: getWuxing(dayZhi, true),
    cangGan: dayZhiCangGan.map(item => ({
      ...item,
      wuxing: getWuxing(item.gan),
      wuxingPinyin: getWuxing(item.gan, true),
    })),
  };

  // 获取时辰信息
  const times = lunar.getTimes();
  // lunar.getTimes() 返回13个时辰（子时分为两部分），我们只取前12个
  const shiChen = times.slice(0, 12).map((time, index) => {
    const jiXiong = getShiChenJiXiong(time);
    const { name, time: timeRange } = getShiChenTimeRange(index);

    return {
      name,
      time: timeRange,
      ganZhi: time.getGanZhi(),
      jiXiong,
    };
  });

  // 地支列表
  const dizhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 计算12个时辰的五行能量
  const shiChenWuxing = dizhiList.map((dizhi, index) => {
    const tiangan = getShiChenGan(dayGan, index);
    const { name, time: timeRange } = getShiChenTimeRange(index);
    const cangGan = getDizhiCangGan(dizhi);

    // 获取时辰的吉凶（从之前计算的shiChen数组中获取）
    const shiChenJiXiong = shiChen[index]?.jiXiong || '平';

    return {
      time: timeRange,
      name,
      tiangan,
      tianganWuxing: getWuxing(tiangan),
      tianganWuxingPinyin: getWuxing(tiangan, true),
      dizhi,
      dizhiWuxing: getWuxing(dizhi),
      dizhiWuxingPinyin: getWuxing(dizhi, true),
      jiXiong: shiChenJiXiong,
      cangGan: cangGan.map(item => ({
        ...item,
        wuxing: getWuxing(item.gan),
        wuxingPinyin: getWuxing(item.gan, true),
      })),
    };
  });

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      weekday: solar.getWeekInChinese(),
      week: getWeekOfYear(solar), // 使用全年周数而非当月周数
    },
    lunar: {
      date: lunar.toString(),
      month: lunar.getMonthInChinese(),
      day: lunar.getDayInChinese(),
      year: lunar.getYearInGanZhi() + '年',
      zodiac: lunar.getYearShengXiao(),
      // 添加完整的月日显示（如：冬月初十）
      monthDay: (lunar.getMonthInChinese().length === 1 ? lunar.getMonthInChinese() + '月' : lunar.getMonthInChinese()) + lunar.getDayInChinese(),
    },
    ganZhi: {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
      // 添加完整的年月日显示
      full: lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInGanZhi() + '月 ' + lunar.getDayInGanZhi() + '日',
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
      daysToSpringFestival,
    },
    yiJi: {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
    },
    chongSha: {
      chong: lunar.getDayChongDesc(),
      sha: lunar.getDaySha(),
      // 格式：冲虎 (丙寅) 煞南
      // getDayChongDesc() 格式是 (干支)生肖，需要调整为 生肖 (干支)
      full: `${lunar.getDayChongShengXiao()} (${lunar.getDayChongGan()}${lunar.getDayChong()}) 煞${lunar.getDaySha()}`,
    },
    zhiRiXingShen: {
      zhiRi: zhiXing + '日',  // 成日
      shiErJianChu: zhiXingType + '日',  // 黄道日/黑道日
      shenSha: lunar.getDayTianShen(),  // 值日神煞名称
    },
    jiShenFangWei: {
      caiShen: baguaToDirection(lunar.getDayPositionCai()),
      xiShen: baguaToDirection(lunar.getDayPositionXi()),
      fuShen: baguaToDirection(lunar.getDayPositionFu()),
      yangGuiShen: baguaToDirection(lunar.getDayPositionYangGui()),
      yinGuiShen: baguaToDirection(lunar.getDayPositionYinGui()),
    },
    shiChen,
    // 新增:时辰五行能量
    wuxingEnergy: {
      liuri: liuriWuxing,
      shiChen: shiChenWuxing,
    },
  };
}

/**
 * 根据日期字符串获取黄历数据
 */
function getCalendarByDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  // 直接使用 JavaScript Date 对象
  const targetDate = new Date(year, month - 1, day);
  return formatCalendarData(targetDate);
}

module.exports = {
  formatCalendarData,
  getCalendarByDateString,
};
