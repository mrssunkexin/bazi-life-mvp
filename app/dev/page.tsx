'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DevPreviewPage() {
  const [apiTest, setApiTest] = useState<{
    loading: boolean;
    result: string;
  }>({ loading: false, result: '' });

  const testCreateReport = async () => {
    setApiTest({ loading: true, result: '测试中...' });
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `测试报告 - ${new Date().toISOString()}`,
          basicSummary: '来自开发页面的测试摘要',
          formJson: JSON.stringify({
            birthDate: '1990-01-01',
            birthTime: '12:00',
            gender: 'male',
            location: '测试地点',
          }),
          status: 'draft',
        }),
      });

      const data = await response.json();
      setApiTest({
        loading: false,
        result: `✅ 成功！\n报告ID: ${data.id}\n创建时间: ${data.createdAt}`,
      });
    } catch (error) {
      setApiTest({
        loading: false,
        result: `❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  };

  const testGetReports = async () => {
    setApiTest({ loading: true, result: '获取报告中...' });
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setApiTest({
        loading: false,
        result: `✅ 找到 ${data.length} 个报告\n${JSON.stringify(data, null, 2)}`,
      });
    } catch (error) {
      setApiTest({
        loading: false,
        result: `❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">🛠️ 开发预览 & 测试页面</h1>
          <p className="text-purple-100">
            八字命理分析 MVP 本地测试环境
          </p>
        </div>

        {/* Pages Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📄 页面导航</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">🏠</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                首页
              </h3>
              <p className="text-sm text-gray-500 mt-1">/</p>
            </Link>

            <Link
              href="/calc"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">🧮</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                八字计算器
              </h3>
              <p className="text-sm text-gray-500 mt-1">/calc</p>
            </Link>

            <Link
              href="/admin/reports/test-id"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                管理后台编辑器
              </h3>
              <p className="text-sm text-gray-500 mt-1">/admin/reports/[id]</p>
              <p className="text-xs text-amber-600 mt-1">
                (需要先创建报告)
              </p>
            </Link>
          </div>
        </div>

        {/* API Testing */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔌 API 接口测试</h2>

          <div className="space-y-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={testCreateReport}
                disabled={apiTest.loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                POST /api/reports (创建报告)
              </button>

              <button
                onClick={testGetReports}
                disabled={apiTest.loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                GET /api/reports (获取所有报告)
              </button>
            </div>

            {apiTest.result && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {apiTest.result}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">可用接口：</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs">
                  POST
                </span>
                <code className="text-gray-700 flex-1">/api/reports</code>
                <span className="text-gray-500">创建新报告</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs">
                  GET
                </span>
                <code className="text-gray-700 flex-1">/api/reports</code>
                <span className="text-gray-500">列出所有报告</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs">
                  GET
                </span>
                <code className="text-gray-700 flex-1">/api/reports/[id]</code>
                <span className="text-gray-500">获取单个报告</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono text-xs">
                  PATCH
                </span>
                <code className="text-gray-700 flex-1">/api/reports/[id]</code>
                <span className="text-gray-500">更新报告</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">💾 数据库</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">数据库类型：</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">SQLite</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">存储位置：</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                ./prisma/dev.db
              </code>
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="font-medium text-gray-700 mb-2">常用命令：</p>
              <div className="space-y-1 text-sm">
                <code className="block bg-gray-900 text-green-400 px-3 py-2 rounded">
                  npm run db:migrate
                </code>
                <code className="block bg-gray-900 text-green-400 px-3 py-2 rounded">
                  npm run db:seed
                </code>
                <code className="block bg-gray-900 text-green-400 px-3 py-2 rounded">
                  npx prisma studio
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Schema Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📋 数据模型</h2>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`model Report {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  status       String   @default("draft")
  title        String
  basicSummary String   @default("")
  fullContent  String   @default("")
  publishAt    DateTime?
  formJson     String   @default("{}")
}`}</pre>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-3">🚀 Quick Start</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>点击上方 "BaZi Calculator" 创建一个新的八字分析</li>
            <li>或使用 API Testing 直接创建测试数据</li>
            <li>获取 Report ID 后访问 Admin 页面进行编辑</li>
            <li>使用 <code className="bg-blue-100 px-2 py-1 rounded">npx prisma studio</code> 查看数据库</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
