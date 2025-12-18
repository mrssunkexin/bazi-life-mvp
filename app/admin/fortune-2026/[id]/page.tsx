'use client';

import { useState, useEffect, use } from 'react';
import ReportPreview from '@/components/ReportPreview';

interface Report {
  id: string;
  title: string;
  basicSummary: string;
  fullContent: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
  name?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  city?: string;
  baziYear?: string;
  baziMonth?: string;
  baziDay?: string;
  baziHour?: string;
  trueSolarTime?: string;
  generatedAt?: string | null;
}

export default function AdminFortune2026ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated && id) {
      fetchReport();
    }
  }, [authenticated, id]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      alert('密码错误');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fortune-2026/${id}`);
      if (!response.ok) throw new Error('获取报告失败');
      const result = await response.json();
      const data = result.data || result;
      setReport(data);

      // logs
      try {
        const logsResponse = await fetch(`/api/fortune-2026/${id}/generation-logs`);
        if (logsResponse.ok) {
          const logsResult = await logsResponse.json();
          setGenerationLogs(logsResult.data?.logs || []);
        }
      } catch (error) {
        console.log('获取生成日志失败:', error);
      }
    } catch (error) {
      console.error('错误:', error);
      alert('加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/fortune-2026/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: report.title,
          basicSummary: report.basicSummary,
          fullContent: report.fullContent,
          status: report.status,
          publishAt: report.publishAt,
        }),
      });
      if (!response.ok) throw new Error('保存报告失败');
      alert('报告保存成功！');
      await fetchReport();
    } catch (error) {
      console.error('错误:', error);
      alert('保存报告失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!report) return;
    const publishNow = new Date().toISOString();
    try {
      const response = await fetch(`/api/fortune-2026/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          publishAt: publishNow,
        }),
      });
      if (!response.ok) throw new Error('发布报告失败');
      alert('报告发布成功！');
      await fetchReport();
    } catch (error) {
      console.error('错误:', error);
      alert('发布报告失败');
    }
  };

  const handleRegenerate = async () => {
    if (!report) return;
    if (!confirm('确定要重新生成此报告吗？这将覆盖现有内容。')) return;
    try {
      const response = await fetch(`/api/fortune-2026/${id}/regenerate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('重新生成失败');
      alert('报告正在重新生成中...');
      await fetchReport();
    } catch (error) {
      console.error('错误:', error);
      alert('重新生成失败');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">管理员登录</h1>
            <p className="text-sm text-gray-500 mb-6">请输入管理员密码</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
              >
                登录
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">加载报告中...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">报告未找到</div>
      </div>
    );
  }

  const actualStatus = (() => {
    if (report.fullContent === '待激活') return 'pending_pay';
    if (report.fullContent === '报告生成中...') return 'generating';
    if (report.status === 'draft' &&
      report.fullContent !== '待激活' &&
      report.fullContent !== '报告生成中...') {
      return 'draft';
    }
    return report.status;
  })();

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition text-sm"
              >
                ← 返回报告列表
              </button>
              <h1 className="text-2xl font-medium text-gray-900">编辑 2026 运势报告</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                actualStatus === 'published'
                  ? 'bg-green-100 text-green-700'
                  : actualStatus === 'generating'
                  ? 'bg-blue-100 text-blue-700'
                  : actualStatus === 'draft'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {actualStatus === 'published'
                  ? '已发布'
                  : actualStatus === 'generating'
                  ? '生成中'
                  : actualStatus === 'draft'
                  ? '草稿'
                  : '待激活'}
              </span>
              {generationLogs.length > 0 && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                >
                  📊 {showLogs ? '隐藏' : '查看'}生成日志
                </button>
              )}
              {(report.fullContent === '报告生成中...' ||
                report.fullContent === '待激活' ||
                report.fullContent?.includes('生成失败') ||
                report.fullContent?.includes('错误类型') ||
                report.fullContent?.includes('错误信息')) && (
                <button
                  onClick={handleRegenerate}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                >
                  🔄 重新生成
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 text-sm"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
              {report.status !== 'published' && (
                <button
                  onClick={handlePublish}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                >
                  发布报告
                </button>
              )}
            </div>
          </div>
        </div>

        {showLogs && generationLogs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🔍 生成日志</h2>
            <div className="space-y-2">
              {generationLogs.map((log) => {
                const statusColor =
                  log.status === 'completed' ? 'text-green-600 bg-green-50' :
                  log.status === 'failed' ? 'text-red-600 bg-red-50' :
                  log.status === 'processing' ? 'text-blue-600 bg-blue-50' :
                  'text-gray-600 bg-gray-50';

                const statusIcon =
                  log.status === 'completed' ? '✅' :
                  log.status === 'failed' ? '❌' :
                  log.status === 'processing' ? '⏳' :
                  '⏸️';

                return (
                  <div key={log.id} className={`flex items-center justify-between p-3 rounded-lg border ${statusColor}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{statusIcon}</span>
                      <div>
                        <div className="font-medium text-sm">{log.stage}</div>
                        {log.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">{log.errorMessage}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.duration !== null && log.duration !== undefined ? `${log.duration}秒` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
              <span className="text-gray-600">总耗时</span>
              <span className="font-medium text-gray-900">
                {generationLogs.reduce((sum, log) => sum + (log.duration || 0), 0)}秒
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {report.baziYear && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <h3 className="text-sm font-bold text-gray-900">八字信息</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">姓名：</span>
                    <span className="font-medium">{report.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">性别：</span>
                    <span className="font-medium">{report.gender === 'male' ? '男' : '女'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">出生日期：</span>
                    <span className="font-medium">{report.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">出生时间：</span>
                    <span className="font-medium">{report.birthTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">出生城市：</span>
                    <span className="font-medium">{report.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">真太阳时：</span>
                    <span className="font-medium">{report.trueSolarTime || '未计算'}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-xs text-gray-600 mb-2">四柱八字：</div>
                  <div className="grid grid-cols-4 gap-2 font-mono text-sm">
                    <div className="bg-white px-3 py-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">年柱</div>
                      <div className="font-semibold">{report.baziYear}</div>
                    </div>
                    <div className="bg-white px-3 py-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">月柱</div>
                      <div className="font-semibold">{report.baziMonth}</div>
                    </div>
                    <div className="bg-white px-3 py-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">日柱</div>
                      <div className="font-semibold">{report.baziDay}</div>
                    </div>
                    <div className="bg-white px-3 py-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">时柱</div>
                      <div className="font-semibold">{report.baziHour}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题
              </label>
              <input
                type="text"
                value={report.title}
                onChange={(e) => setReport({ ...report, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基础摘要
              </label>
              <textarea
                value={report.basicSummary}
                onChange={(e) => setReport({ ...report, basicSummary: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                报告完整内容
              </label>
              <textarea
                value={report.fullContent}
                onChange={(e) => setReport({ ...report, fullContent: e.target.value })}
                rows={30}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm resize-y"
                placeholder="报告完整内容（支持Markdown格式）"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 提示：支持Markdown格式，使用 ## 创建章节标题
              </p>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-full">
              <ReportPreview
                title={report.title}
                content={report.fullContent}
                status={report.status}
                createdAt={report.createdAt}
                generatedAt={report.generatedAt || undefined}
                publishAt={report.publishAt || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
