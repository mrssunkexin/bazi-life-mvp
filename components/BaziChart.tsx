'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BaziData {
  wuxing: {
    木: number;
    火: number;
    土: number;
    金: number;
    水: number;
    dominant: string;
    weak: string[];
  };
  shishen: {
    tiangan: { [key: string]: string };
    dizhi: { [key: string]: string };
    stats: { [key: string]: number };
    dominant: string;
  };
}

interface BaziChartProps {
  bazi: BaziData;
  baziPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

export default function BaziChart({ bazi, baziPillars }: BaziChartProps) {
  // 五行配色
  const wuxingColors: { [key: string]: string } = {
    木: '#10b981',
    火: '#ef4444',
    土: '#f59e0b',
    金: '#eab308',
    水: '#3b82f6',
  };

  // 准备五行饼图数据
  const wuxingData = Object.entries(bazi.wuxing)
    .filter(([key]) => ['木', '火', '土', '金', '水'].includes(key))
    .map(([name, value]) => ({
      name,
      value: Math.round((value as number) * 100),
      color: wuxingColors[name],
    }));

  // 准备十神统计数据
  const shishenData = Object.entries(bazi.shishen.stats).map(([name, count]) => ({
    name,
    value: count,
  }));

  const shishenColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg px-4 py-2">
          <p className="font-bold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            占比: <span className="font-semibold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* 五行相生相克关系图 */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl shadow-lg border-2 border-amber-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">五行身弱型分析</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：五行饼图 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">五行分布占比</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wuxingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wuxingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm font-medium text-gray-700">
                      {value} ({entry.payload.value}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 右侧：五行信息卡片 */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-amber-200 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <h4 className="text-lg font-bold text-gray-800">日主五行</h4>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg"
                  style={{ backgroundColor: wuxingColors[baziPillars.day[1] === '甲' || baziPillars.day[1] === '乙' ? '木' :
                    baziPillars.day[1] === '丙' || baziPillars.day[1] === '丁' ? '火' :
                    baziPillars.day[1] === '戊' || baziPillars.day[1] === '己' ? '土' :
                    baziPillars.day[1] === '庚' || baziPillars.day[1] === '辛' ? '金' : '水'] }}
                >
                  {baziPillars.day[1]}
                </div>
                <div>
                  <p className="text-sm text-gray-600">日干五行</p>
                  <p className="text-2xl font-black text-gray-900">
                    {baziPillars.day[1] === '甲' || baziPillars.day[1] === '乙' ? '木' :
                     baziPillars.day[1] === '丙' || baziPillars.day[1] === '丁' ? '火' :
                     baziPillars.day[1] === '戊' || baziPillars.day[1] === '己' ? '土' :
                     baziPillars.day[1] === '庚' || baziPillars.day[1] === '辛' ? '金' : '水'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-green-200 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌟</span>
                <h4 className="text-lg font-bold text-gray-800">主导五行</h4>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg"
                  style={{ backgroundColor: wuxingColors[bazi.wuxing.dominant] }}
                >
                  {bazi.wuxing.dominant}
                </div>
                <div>
                  <p className="text-sm text-gray-600">占比最高</p>
                  <p className="text-2xl font-black text-gray-900">
                    {Math.round(wuxingData.find(d => d.name === bazi.wuxing.dominant)?.value || 0)}%
                  </p>
                </div>
              </div>
            </div>

            {bazi.wuxing.weak && bazi.wuxing.weak.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <h4 className="text-lg font-bold text-gray-800">弱势五行</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bazi.wuxing.weak.map((element) => (
                    <span
                      key={element}
                      className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-md"
                      style={{ backgroundColor: wuxingColors[element] }}
                    >
                      {element}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  建议在生活中多补充这些五行元素
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 喜用建议 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
          <div className="text-center">
            <h4 className="text-xl font-bold text-gray-800 mb-4">💡 喜用建议</h4>
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">幸运颜色</p>
                <div className="flex gap-2 justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">幸运方位</p>
                <span className="inline-block px-6 py-2 bg-white rounded-full text-lg font-bold text-red-600 border-2 border-red-200 shadow-md">
                  东北
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">幸运数字</p>
                <div className="flex gap-2 justify-center">
                  <span className="inline-block w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold text-red-600 border-2 border-red-200 shadow-md">
                    83
                  </span>
                  <span className="inline-block w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold text-red-600 border-2 border-red-200 shadow-md">
                    61
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 十神分析图表 */}
      {shishenData.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-3xl shadow-lg border-2 border-purple-100 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">十神分析</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 十神饼图 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">十神分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shishenData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {shishenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={shishenColors[index % shishenColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                      <span className="text-sm font-medium text-gray-700">
                        {value} ({entry.payload.value}个)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 十神卡片 */}
            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 p-5 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👑</span>
                  <h4 className="text-lg font-bold text-gray-800">主星十神</h4>
                </div>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {bazi.shishen.dominant}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 p-5 shadow-md">
                <h4 className="text-sm font-bold text-gray-700 mb-3">天干十神</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(bazi.shishen.tiangan).map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">{key}</p>
                      <p className="text-sm font-bold text-purple-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 p-5 shadow-md">
                <h4 className="text-sm font-bold text-gray-700 mb-3">地支十神</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(bazi.shishen.dizhi).map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600">{key}</p>
                      <p className="text-sm font-bold text-purple-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
