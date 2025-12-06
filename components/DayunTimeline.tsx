'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface DayunPeriod {
  ganzhi: string;
  startAge: number;
  endAge: number;
  quality: '大吉' | '吉' | '平' | '凶' | '大凶';
  description?: string;
}

interface DayunTimelineProps {
  dayunList: DayunPeriod[];
}

export default function DayunTimeline({ dayunList }: DayunTimelineProps) {
  if (!dayunList || dayunList.length === 0) {
    return null;
  }

  const colorMap = {
    '大吉': { color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-200', shadow: 'shadow-emerald-500/20', emoji: '🌟' },
    '吉': { color: '#84cc16', bg: 'bg-lime-500', border: 'border-lime-200', shadow: 'shadow-lime-500/20', emoji: '✨' },
    '平': { color: '#9ca3af', bg: 'bg-gray-400', border: 'border-gray-200', shadow: 'shadow-gray-400/20', emoji: '➖' },
    '凶': { color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-200', shadow: 'shadow-amber-500/20', emoji: '⚠️' },
    '大凶': { color: '#ef4444', bg: 'bg-red-500', border: 'border-red-200', shadow: 'shadow-red-500/20', emoji: '⛔' },
  };

  const data = dayunList.map(d => ({
    name: d.ganzhi,
    startAge: d.startAge,
    endAge: d.endAge,
    duration: d.endAge - d.startAge,
    quality: d.quality,
    description: d.description || '',
    color: colorMap[d.quality].color,
    config: colorMap[d.quality],
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-2xl p-4 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{data.config.emoji}</span>
            <p className="font-bold text-lg text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">年龄段：</span>{data.startAge}-{data.endAge}岁
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">运势：</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: data.color }}>
                {data.quality}
              </span>
            </div>
          </div>
          {data.description && (
            <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed">{data.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6">
      {/* 时间轴图表 */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 shadow-sm">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={data}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeWidth={1} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  label={{ value: '年龄 (岁)', position: 'bottom', offset: 10, style: { fill: '#475569', fontWeight: 600 } }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#1e293b', fontSize: 14, fontWeight: 700 }}
                  width={70}
                  tickLine={{ stroke: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Bar dataKey="startAge" stackId="a" fill="transparent" />
                <Bar dataKey="duration" stackId="a" radius={[0, 12, 12, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(colorMap).map(([quality, config]) => (
          <div
            key={quality}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 shadow-sm hover:shadow-md transition-shadow"
            style={{ borderColor: config.color + '40' }}
          >
            <span className="text-lg">{config.emoji}</span>
            <div className={`w-3 h-3 rounded-full ${config.bg} shadow-md`}></div>
            <span className="text-sm font-semibold text-gray-700">{quality}</span>
          </div>
        ))}
      </div>

      {/* 大运详细卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((period, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-2xl border-2 ${period.config.border} bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            {/* 装饰性背景 */}
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10"
              style={{ backgroundColor: period.color }}
            />

            <div className="relative p-5 flex items-center gap-4">
              {/* 大运干支 */}
              <div
                className={`flex-shrink-0 w-20 h-20 rounded-xl ${period.config.bg} shadow-lg flex flex-col items-center justify-center transform group-hover:rotate-6 transition-transform`}
              >
                <div className="text-white text-xl font-black">{period.name}</div>
                <div className="text-white/90 text-xs font-medium mt-1">{period.config.emoji}</div>
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-bold text-gray-900">
                    {period.startAge} - {period.endAge} 岁
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                    style={{ backgroundColor: period.color }}>
                    {period.quality}
                  </span>
                </div>

                {/* 进度条 */}
                <div className="mb-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(period.duration / 10) * 100}%`,
                      backgroundColor: period.color,
                    }}
                  />
                </div>

                {period.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {period.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
