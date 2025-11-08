'use client';

import { useState, useEffect, use } from 'react';

interface Report {
  id: string;
  title: string;
  basicSummary: string;
  fullContent: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if already authenticated in session
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
    // Simple password check - in production, use proper auth
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
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) throw new Error('获取报告失败');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error:', error);
      alert('加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
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
      await fetchReport(); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      alert('保存报告失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!report) return;
    const publishNow = new Date().toISOString();

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
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
      console.error('Error:', error);
      alert('发布报告失败');
    }
  };

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">管理后台</h1>
            <p className="text-sm text-gray-500 mb-6">请输入密码继续</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // No report found
  if (!report) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">未找到报告</div>
      </div>
    );
  }

  // Admin editor
  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-gray-900">编辑报告</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                report.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {report.status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
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

            {/* Basic Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基础分析
              </label>
              <textarea
                value={report.basicSummary}
                onChange={(e) => setReport({ ...report, basicSummary: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完整内容（支持 Markdown）
              </label>
              <textarea
                value={report.fullContent}
                onChange={(e) => setReport({ ...report, fullContent: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500">创建时间</div>
                <div className="text-sm text-gray-700 mt-1">
                  {new Date(report.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">更新时间</div>
                <div className="text-sm text-gray-700 mt-1">
                  {new Date(report.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
              {report.status !== 'published' && (
                <button
                  onClick={handlePublish}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition"
                >
                  发布报告
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/calc" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← 返回测算页
          </a>
        </div>
      </div>
    </div>
  );
}
