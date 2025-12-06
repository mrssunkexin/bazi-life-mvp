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
  // 新增字段
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
}

export default function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<string[]>([]);

  // Parse content into sections
  const parseContentIntoSections = (content: string): string[] => {
    if (!content) return [''];
    // Split by ## headers to create sections
    const parts = content.split(/(?=^## )/gm).filter(Boolean);
    return parts.length > 0 ? parts : [content];
  };

  // Merge sections back into full content
  const mergeSectionsIntoContent = (secs: string[]): string => {
    return secs.join('\n\n');
  };

  // Update specific section
  const updateSection = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index] = value;
    setSections(newSections);

    // Update the report's fullContent
    if (report) {
      setReport({
        ...report,
        fullContent: mergeSectionsIntoContent(newSections)
      });
    }
  };

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
      // Parse content into sections
      setSections(parseContentIntoSections(data.fullContent || ''));
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
      const response = await fetch(`/api/reports/${id}`, {
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
      await fetchReport(); // Refresh data
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
      const response = await fetch(`/api/reports/${id}`, {
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

  // Password gate
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">加载报告中...</div>
      </div>
    );
  }

  // No report found
  if (!report) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">报告未找到</div>
      </div>
    );
  }

  // Admin editor
  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium text-gray-900">编辑报告</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                report.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {report.status === 'published' ? '已发布' : '草稿'}
              </span>
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

        {/* Two-column Layout: Editor + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="space-y-6">
            {/* 八字信息显示（只读） */}
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
                基础摘要
              </label>
              <textarea
                value={report.basicSummary}
                onChange={(e) => setReport({ ...report, basicSummary: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
              />
            </div>

            {/* Modular Content Sections */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📝</span>
                <label className="text-sm font-bold text-gray-700">
                  内容模块 <span className="text-xs font-normal text-gray-500">(支持 Markdown)</span>
                </label>
              </div>
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div key={index} className="group bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        {section.match(/^## (.+)/m) && (
                          <span className="text-indigo-600">
                            {section.match(/^## (.+)/m)![1]}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          {section.length} 字符
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                          {section.split('\n').length} 行
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={section}
                      onChange={(e) => updateSection(index, e.target.value)}
                      rows={Math.min(Math.max(section.split('\n').length, 6), 15)}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition font-mono text-xs leading-relaxed bg-gray-50 group-hover:bg-white"
                      placeholder="输入内容..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-500">创建时间</div>
                  <div className="text-gray-700 mt-1">
                    {new Date(report.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">更新时间</div>
                  <div className="text-gray-700 mt-1">
                    {new Date(report.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div>
            <ReportPreview content={report.fullContent} title={report.title} />
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← 返回管理后台
          </a>
        </div>
      </div>
    </div>
  );
}
