'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface WuxingData {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

interface WuxingRadarProps {
  wuxing: WuxingData;
}

export default function WuxingRadar({ wuxing }: WuxingRadarProps) {
  // 五行配色方案（基于传统五行颜色）
  const wuxingColors = {
    木: { color: '#10b981', bg: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30', text: 'text-emerald-700' },
    火: { color: '#ef4444', bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', text: 'text-red-700' },
    土: { color: '#f59e0b', bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', text: 'text-amber-700' },
    金: { color: '#eab308', bg: 'from-slate-400/20 to-zinc-400/20', border: 'border-slate-400/30', text: 'text-slate-700' },
    水: { color: '#3b82f6', bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-700' },
  };

  const data = [
    { subject: '木', value: Math.round(wuxing.木 * 100), fullMark: 100, color: wuxingColors.木.color },
    { subject: '火', value: Math.round(wuxing.火 * 100), fullMark: 100, color: wuxingColors.火.color },
    { subject: '土', value: Math.round(wuxing.土 * 100), fullMark: 100, color: wuxingColors.土.color },
    { subject: '金', value: Math.round(wuxing.金 * 100), fullMark: 100, color: wuxingColors.金.color },
    { subject: '水', value: Math.round(wuxing.水 * 100), fullMark: 100, color: wuxingColors.水.color },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg px-4 py-2">
          <p className="font-bold text-gray-900">{payload[0].payload.subject}</p>
          <p className="text-sm text-gray-600">强度: <span className="font-semibold">{payload[0].value}%</span></p>
        </div>
      );
    }
    return null;
  };

  //找出主导五行和弱势五行
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const dominantElement = sortedData[0];
  const weakElements = sortedData.filter(d => d.value < 15);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 雷达图 */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">五行能量分布</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data}>
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="#cbd5e1" strokeWidth={1.5} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#1f2937', fontSize: 16, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickCount={6}
              />
              <Radar
                name="五行强度"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#radarGradient)"
                fillOpacity={0.7}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 五行分析卡片 */}
        <div className="space-y-4">
          {/* 主导五行 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👑</span>
              <h4 className="text-lg font-bold text-gray-800">主导五行</h4>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg"
                style={{ backgroundColor: dominantElement.color }}
              >
                {dominantElement.subject}
              </div>
              <div>
                <p className="text-sm text-gray-600">占比最高</p>
                <p className="text-3xl font-black text-gray-900">{dominantElement.value}%</p>
              </div>
            </div>
          </div>

          {/* 弱势五行 */}
          {weakElements.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <h4 className="text-lg font-bold text-gray-800">需要补充</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {weakElements.map((element) => (
                  <span
                    key={element.subject}
                    className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: element.color }}
                  >
                    {element.subject} ({element.value}%)
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                建议在生活中多补充这些五行元素
              </p>
            </div>
          )}

          {/* 身强/身弱提示 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💫</span>
              <h4 className="text-lg font-bold text-gray-800">五行平衡</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dominantElement.value > 30
                ? `您的命局${dominantElement.subject}气偏旺，建议适度平衡其他五行元素`
                : '您的命局五行相对平衡，整体协调性较好'}
            </p>
          </div>
        </div>
      </div>

      {/* 五行详细卡片 */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {data.map((item) => {
          const element = item.subject as keyof typeof wuxingColors;
          const config = wuxingColors[element];
          return (
            <div
              key={item.subject}
              className={`relative overflow-hidden rounded-xl border-2 ${config.border} bg-gradient-to-br ${config.bg} backdrop-blur-sm p-4 transition-all hover:scale-105 hover:shadow-lg`}
            >
              {/* 背景装饰 */}
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/20" />

              <div className="relative z-10">
                <div className={`text-lg font-bold ${config.text} mb-1`}>
                  {item.subject}
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {item.value}
                  <span className="text-sm font-medium text-gray-600 ml-0.5">%</span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 喜用神建议 */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl border-2 border-purple-200 p-8">
        <div className="text-center">
          <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
            <span className="text-2xl">💡</span>
            喜用神建议
          </h4>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">幸运颜色</p>
              <div className="flex gap-2 justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg border-4 border-white"></div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg border-4 border-white"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">幸运方位</p>
              <span className="inline-block px-6 py-3 bg-white rounded-full text-lg font-bold text-red-600 border-2 border-red-200 shadow-md">
                东北方
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">幸运数字</p>
              <div className="flex gap-3 justify-center">
                <span className="inline-block w-14 h-14 bg-white rounded-full flex items-center justify-center text-xl font-bold text-red-600 border-2 border-red-200 shadow-md">
                  3
                </span>
                <span className="inline-block w-14 h-14 bg-white rounded-full flex items-center justify-center text-xl font-bold text-red-600 border-2 border-red-200 shadow-md">
                  8
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
