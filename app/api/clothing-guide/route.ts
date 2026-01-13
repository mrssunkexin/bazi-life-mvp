/**
 * 五行穿衣指南 API 接口
 * GET /api/clothing-guide?date=2026-01-13
 */

import { NextRequest, NextResponse } from 'next/server';

// 使用 require 导入 lunar-javascript（CommonJS 模块）
const { Lunar, Solar } = require('lunar-javascript');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    let date: Date;

    if (dateParam) {
      // 验证日期格式
      const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
      if (!dateRegex.test(dateParam)) {
        return NextResponse.json(
          {
            success: false,
            error: '日期格式错误，应为 YYYY-MM-DD',
          },
          { status: 400 }
        );
      }

      const [year, month, day] = dateParam.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date();
    }

    // 获取农历数据
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // 获取日干支
    const dayGanZhi = lunar.getDayInGanZhi();
    const dayZhi = lunar.getDayZhi(); // 获取地支

    // 地支对应五行
    const zhiWuxingMap: { [key: string]: string } = {
      子: '水',
      丑: '土',
      寅: '木',
      卯: '木',
      辰: '土',
      巳: '火',
      午: '火',
      未: '土',
      申: '金',
      酉: '金',
      戌: '土',
      亥: '水',
    };

    // 获取当日五行
    const dayWuxing = zhiWuxingMap[dayZhi];

    // 五行颜色对应关系
    const wuxingColorsMap: { [key: string]: { name: string; colors: string[] } } = {
      金: { name: '金', colors: ['白色', '银色', '杏色', '乳白色'] },
      木: { name: '木', colors: ['绿色', '青色', '翠色', '浅绿'] },
      水: { name: '水', colors: ['黑色', '蓝色', '灰色'] },
      火: { name: '火', colors: ['红色', '粉色', '橙色', '紫色'] },
      土: { name: '土', colors: ['黄色', '咖啡', '棕色', '卡其', '褐色'] },
    };

    // 五行生克关系计算
    const getColorLevels = (dayWuxing: string) => {
      // 五行生我（吉色）
      const shengMap: { [key: string]: string } = {
        金: '土',
        木: '水',
        水: '金',
        火: '木',
        土: '火',
      };

      // 同我（次吉色）
      const tongWuxing = dayWuxing;

      // 我克（平色/进财色）
      const keMap: { [key: string]: string } = {
        金: '木',
        木: '土',
        水: '火',
        火: '金',
        土: '水',
      };

      // 我生（忌色/消耗色）
      const woShengMap: { [key: string]: string } = {
        金: '水',
        木: '火',
        水: '木',
        火: '土',
        土: '金',
      };

      // 克我（凶色）
      const keMeMap: { [key: string]: string } = {
        金: '火',
        木: '金',
        水: '土',
        火: '水',
        土: '木',
      };

      return {
        吉: {
          wuxing: shengMap[dayWuxing],
          name: wuxingColorsMap[shengMap[dayWuxing]].name,
          colors: wuxingColorsMap[shengMap[dayWuxing]].colors,
          description: '贵人色，大吉。寓意容易得到贵人的帮助，事事顺心如意。',
        },
        次吉: {
          wuxing: tongWuxing,
          name: wuxingColorsMap[tongWuxing].name,
          colors: wuxingColorsMap[tongWuxing].colors,
          description: '合作色，次吉。与当日五行相同，与他人合作有利。',
        },
        平: {
          wuxing: keMap[dayWuxing],
          name: wuxingColorsMap[keMap[dayWuxing]].name,
          colors: wuxingColorsMap[keMap[dayWuxing]].colors,
          description: '进财色，平。需付出更多努力，做事会比较累，但能够得到较大的收获。',
        },
        忌: {
          wuxing: woShengMap[dayWuxing],
          name: wuxingColorsMap[woShengMap[dayWuxing]].name,
          colors: wuxingColorsMap[woShengMap[dayWuxing]].colors,
          description: '消耗色，忌。寓意消耗过大，容易疲惫。',
        },
        凶: {
          wuxing: keMeMap[dayWuxing],
          name: wuxingColorsMap[keMeMap[dayWuxing]].name,
          colors: wuxingColorsMap[keMeMap[dayWuxing]].colors,
          description: '不利色，凶。面临重重困难，不宜行事。',
        },
      };
    };

    // 生肖关系计算
    const getShengxiaoRelations = (dayZhi: string) => {
      // 地支对应生肖
      const zhiShengxiaoMap: { [key: string]: string } = {
        子: '鼠',
        丑: '牛',
        寅: '虎',
        卯: '兔',
        辰: '龙',
        巳: '蛇',
        午: '马',
        未: '羊',
        申: '猴',
        酉: '鸡',
        戌: '狗',
        亥: '猪',
      };

      // 六合、三合关系（特吉生肖）
      const liuheMap: { [key: string]: string } = {
        子: '丑',
        丑: '子',
        寅: '亥',
        卯: '戌',
        辰: '酉',
        巳: '申',
        午: '未',
        未: '午',
        申: '巳',
        酉: '辰',
        戌: '卯',
        亥: '寅',
      };

      const sanheMap: { [key: string]: string[] } = {
        子: ['申', '辰'], // 申子辰三合
        丑: ['巳', '酉'], // 巳酉丑三合
        寅: ['午', '戌'], // 寅午戌三合
        卯: ['亥', '未'], // 亥卯未三合
        辰: ['申', '子'], // 申子辰三合
        巳: ['酉', '丑'], // 巳酉丑三合
        午: ['寅', '戌'], // 寅午戌三合
        未: ['卯', '亥'], // 亥卯未三合
        申: ['子', '辰'], // 申子辰三合
        酉: ['巳', '丑'], // 巳酉丑三合
        戌: ['寅', '午'], // 寅午戌三合
        亥: ['卯', '未'], // 亥卯未三合
      };

      // 冲、刑、害关系（需要注意的生肖）
      const chongMap: { [key: string]: string } = {
        子: '午',
        丑: '未',
        寅: '申',
        卯: '酉',
        辰: '戌',
        巳: '亥',
        午: '子',
        未: '丑',
        申: '寅',
        酉: '卯',
        戌: '辰',
        亥: '巳',
      };

      const xingMap: { [key: string]: string[] } = {
        子: ['卯'],
        丑: ['戌', '未'],
        寅: ['巳', '申'],
        卯: ['子'],
        辰: ['辰'],
        巳: ['申', '寅'],
        午: ['午'],
        未: ['丑', '戌'],
        申: ['寅', '巳'],
        酉: ['酉'],
        戌: ['丑', '未'],
        亥: ['亥'],
      };

      const haiMap: { [key: string]: string } = {
        子: '未',
        丑: '午',
        寅: '巳',
        卯: '辰',
        辰: '卯',
        巳: '寅',
        午: '丑',
        未: '子',
        申: '亥',
        酉: '戌',
        戌: '酉',
        亥: '申',
      };

      // 特吉生肖（六合 + 三合）
      const tejiShengxiao: string[] = [];
      if (liuheMap[dayZhi]) {
        tejiShengxiao.push(zhiShengxiaoMap[liuheMap[dayZhi]]);
      }
      if (sanheMap[dayZhi]) {
        sanheMap[dayZhi].forEach((zhi) => {
          tejiShengxiao.push(zhiShengxiaoMap[zhi]);
        });
      }

      // 次吉生肖（生我、我生的五行对应的生肖）
      // 简化：取与当日地支相邻的生肖
      const cijiZhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const currentIndex = cijiZhis.indexOf(dayZhi);
      const cijiIndices = [
        (currentIndex + 1) % 12,
        (currentIndex + 11) % 12,
      ];
      const cijiShengxiao = cijiIndices
        .map((i) => cijiZhis[i])
        .filter((zhi) => !tejiShengxiao.includes(zhiShengxiaoMap[zhi]))
        .map((zhi) => zhiShengxiaoMap[zhi])
        .slice(0, 3);

      // 需要注意的生肖（冲、刑、害）
      const zhuyiShengxiao: string[] = [];
      if (chongMap[dayZhi]) {
        zhuyiShengxiao.push(zhiShengxiaoMap[chongMap[dayZhi]]);
      }
      if (xingMap[dayZhi]) {
        xingMap[dayZhi].forEach((zhi) => {
          if (!zhuyiShengxiao.includes(zhiShengxiaoMap[zhi])) {
            zhuyiShengxiao.push(zhiShengxiaoMap[zhi]);
          }
        });
      }
      if (haiMap[dayZhi]) {
        const haiShengxiao = zhiShengxiaoMap[haiMap[dayZhi]];
        if (!zhuyiShengxiao.includes(haiShengxiao)) {
          zhuyiShengxiao.push(haiShengxiao);
        }
      }

      return {
        current: zhiShengxiaoMap[dayZhi],
        teji: tejiShengxiao.slice(0, 3), // 最多3个
        ciji: cijiShengxiao.slice(0, 3), // 最多3个
        zhuyi: zhuyiShengxiao.slice(0, 3), // 最多3个
      };
    };

    const colorLevels = getColorLevels(dayWuxing);
    const shengxiaoRelations = getShengxiaoRelations(dayZhi);

    return NextResponse.json({
      success: true,
      data: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          weekday: solar.getWeek(),
        },
        lunar: {
          monthDay: lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
          ganZhi: dayGanZhi,
        },
        dayWuxing: dayWuxing,
        dayZhi: dayZhi,
        colorGuide: colorLevels,
        shengxiao: shengxiaoRelations,
      },
    });
  } catch (error) {
    console.error('穿衣指南 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
