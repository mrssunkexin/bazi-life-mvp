'use client';

import { useState, useEffect, use } from 'react';
import ReactMarkdown from 'react-markdown';
import WuxingRadar from '@/components/WuxingRadar';
import DayunTimeline from '@/components/DayunTimeline';
import BaziChart from '@/components/BaziChart';

interface Report {
  id: string;
  title: string;
  basicSummary: string;
  fullContent: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
  wuxing: string;
  dayun: string;
  baziYear: string;
  baziMonth: string;
  baziDay: string;
  baziHour: string;
  formJson: string;
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotify, setShowNotify] = useState(true);
  const [showQr, setShowQr] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  useEffect(() => {
    loadConfigs();
  }, []);

  const parseBoolean = (value: unknown, defaultValue: boolean) => {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowered = value.toLowerCase();
      if (lowered === 'false' || lowered === '0') return false;
      if (lowered === 'true' || lowered === '1') return true;
    }
    if (typeof value === 'number') return value !== 0;
    return defaultValue;
  };

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/config?keys=waiting_show_notify,waiting_show_qr');
      const data = await res.json();
      const config = data?.data || {};

      // 缺失时默认展示，保证现有行为不变
      setShowNotify(parseBoolean(config.waiting_show_notify, true));
      setShowQr(parseBoolean(config.waiting_show_qr, true));
    } catch (err) {
      console.warn('⚠️ 获取等待页配置失败，使用默认值', err);
      setShowNotify(true);
      setShowQr(true);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('报告未找到');
        } else {
          setError('获取报告失败');
        }
        return;
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('错误:', err);
      setError('加载报告时出错');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">{error}</h1>
          <a
            href="/calc"
            className="inline-block mt-6 text-blue-600 hover:text-blue-700 transition"
          >
            ← 返回计算器
          </a>
        </div>
      </div>
    );
  }

  // No report found
  if (!report) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600">报告不存在</p>
          <a
            href="/calc"
            className="inline-block mt-6 text-blue-600 hover:text-blue-700 transition"
          >
            ← 返回计算器
          </a>
        </div>
      </div>
    );
  }

  // Draft/Analyzing state
  if (report.status === 'draft') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mb-6">
              <div className="inline-block animate-pulse">
                <svg
                  className="w-16 h-16 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-medium text-gray-900 mb-4">
              正在分析中
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              专业人员正在为您分析八字命理
            </p>
            <p className="text-sm text-gray-500">
              请耐心等待，我们会尽快完成分析
            </p>

            {showNotify && (
              <p className="text-sm text-blue-600 font-medium mt-4 mb-6">
                完成后将第一时间通知您
              </p>
            )}

            {showQr && (
              <div className="bg-gradient-to-b from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 mb-8">
                <div className="text-sm font-semibold text-gray-800 mb-3">
                  关注公众号获取通知
                </div>
                <div className="bg-white rounded-xl shadow-inner p-4 flex flex-col items-center gap-3">
                  <div className="w-44 h-44 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    二维码
                  </div>
                  <div className="text-xs text-gray-500">
                    长按识别二维码关注
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-sm font-medium text-gray-700 mb-3">报告信息</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>报告编号：</span>
                  <span className="font-mono text-xs">{report.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>创建时间：</span>
                  <span>{new Date(report.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>状态：</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    分析中
                  </span>
                </div>
              </div>
            </div>

            <a
              href="/calc"
              className="inline-block text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← 返回计算器
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Published report view
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-medium text-gray-900">
              {report.title}
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap ml-4">
              已完成
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div>
              <span className="text-gray-400">发布时间：</span>
              {report.publishAt
                ? new Date(report.publishAt).toLocaleString('zh-CN')
                : new Date(report.updatedAt).toLocaleString('zh-CN')
              }
            </div>
            <div>
              <span className="text-gray-400">报告编号：</span>
              <span className="font-mono text-xs">{report.id}</span>
            </div>
          </div>
        </div>

        {/* Basic Info Visualization */}
        {report.baziYear && report.wuxing && (
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-3xl shadow-lg border-2 border-gray-100 p-8 md:p-10 mb-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">八字基本信息</h2>
            </div>

            {/* 四柱八字 - 传统卡片样式 */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">🀄</span>
                <h3 className="text-lg font-bold text-gray-800">四柱八字</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {/* 年柱 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl border-3 border-red-200 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-center py-2.5">
                      <div className="text-xs font-bold tracking-wider">年柱</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-red-50/50 to-orange-50/50">
                      <div className="text-4xl font-black text-center text-gray-900 tracking-wider">
                        {report.baziYear}
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                  </div>
                </div>

                {/* 月柱 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl border-3 border-green-200 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-center py-2.5">
                      <div className="text-xs font-bold tracking-wider">月柱</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                      <div className="text-4xl font-black text-center text-gray-900 tracking-wider">
                        {report.baziMonth}
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  </div>
                </div>

                {/* 日柱 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl border-3 border-blue-200 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-center py-2.5">
                      <div className="text-xs font-bold tracking-wider">日柱 (日主)</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                      <div className="text-4xl font-black text-center text-gray-900 tracking-wider">
                        {report.baziDay}
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  </div>
                </div>

                {/* 时柱 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl border-3 border-purple-200 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-center py-2.5">
                      <div className="text-xs font-bold tracking-wider">时柱</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                      <div className="text-4xl font-black text-center text-gray-900 tracking-wider">
                        {report.baziHour}
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 text-sm font-medium text-gray-500">
                  ⚡ 五行能量分析
                </span>
              </div>
            </div>

            {/* 五行雷达图 */}
            <div>
              <WuxingRadar wuxing={JSON.parse(report.wuxing || '{}')} />
            </div>
          </div>
        )}

        {/* 大运时间轴 */}
        {report.dayun && (
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-3xl shadow-lg border-2 border-gray-100 p-8 md:p-10 mb-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">大运分析</h2>
              <span className="ml-auto text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-md">
                10年一运
              </span>
            </div>
            <DayunTimeline dayunList={JSON.parse(report.dayun || '[]')} />
          </div>
        )}

        {/* Basic Summary */}
        {report.basicSummary && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基础摘要</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {report.basicSummary}
            </div>
          </div>
        )}

        {/* Full Content */}
        {report.fullContent && (
          <div className="space-y-1 mb-6">
            <ReactMarkdown
              components={{
                h1: ({ node, children, ...props }) => (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg p-6 mb-6 mt-8" {...props}>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="text-3xl">📘</span>
                      {children}
                    </h1>
                  </div>
                ),
                h2: ({ node, children, ...props }) => (
                  <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-md border-2 border-gray-100 p-8 mb-4 mt-6" {...props}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
                    </div>
                  </div>
                ),
                h3: ({ node, children, ...props }) => (
                  <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2 pl-6" {...props}>
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {children}
                  </h3>
                ),
                h4: ({ node, children, ...props }) => (
                  <h4 className="text-lg font-semibold text-gray-700 mt-4 mb-2 pl-6" {...props}>
                    {children}
                  </h4>
                ),
                p: ({ node, children, ...props }) => (
                  <p className="text-gray-700 leading-relaxed mb-4 text-base pl-6 pr-6" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-2 mb-4 pl-6" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="space-y-2 mb-4 pl-6" {...props} />
                ),
                li: ({ node, children, ...props }) => (
                  <li className="flex items-start gap-3 text-gray-700 leading-relaxed" {...props}>
                    <span className="text-blue-500 mt-1.5 flex-shrink-0">▸</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                strong: ({ node, children, ...props }) => (
                  <strong className="font-bold text-gray-900 bg-yellow-50 px-1 rounded" {...props}>
                    {children}
                  </strong>
                ),
                em: ({ node, children, ...props }) => (
                  <em className="italic text-indigo-600 font-medium" {...props}>
                    {children}
                  </em>
                ),
                blockquote: ({ node, children, ...props }) => (
                  <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 pl-4 pr-4 py-3 italic text-gray-700 my-4 rounded-r-lg ml-6 mr-6" {...props}>
                    {children}
                  </blockquote>
                ),
                code: ({ node, children, ...props }) => (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-indigo-600 border border-gray-200" {...props}>
                    {children}
                  </code>
                ),
                hr: ({ node, ...props }) => (
                  <div className="relative my-8" {...props}>
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-gray-400">✦</span>
                    </div>
                  </div>
                ),
              }}
            >
              {report.fullContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <a
            href="/calc"
            className="inline-block text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← 返回计算器
          </a>
        </div>
      </div>
    </div>
  );
}
