'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  city: string;
  status: string;
  createdAt: string;
  baziYear: string;
  baziMonth: string;
  baziDay: string;
  baziHour: string;
}

export default function AdminHomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'generating'>('all');

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setAuthenticated(true);
      fetchReports();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      fetchReports();
    } else {
      alert('密码错误');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('获取报告列表失败');
      const result = await response.json();
      const data = result.data || result;
      setReports(Array.isArray(data) ? data : []);
      setFilteredReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('错误:', error);
      alert('加载报告列表失败');
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  // 筛选报告
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReports(reports);
    } else if (statusFilter === 'generating') {
      // 判断为"生成中"的条件: status=draft 且 fullContent='报告生成中...'
      setFilteredReports(reports.filter(r =>
        r.status === 'draft' && (r as any).fullContent === '报告生成中...'
      ));
    } else {
      setFilteredReports(reports.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reports]);

  // 计算各状态数量
  const getStatusCount = (status: 'published' | 'draft' | 'generating') => {
    if (status === 'generating') {
      return reports.filter(r =>
        r.status === 'draft' && (r as any).fullContent === '报告生成中...'
      ).length;
    }
    return reports.filter(r => r.status === status).length;
  };

  // 获取报告的实际状态(用于显示)
  const getReportStatus = (report: Report) => {
    if (report.status === 'draft' && (report as any).fullContent === '报告生成中...') {
      return 'generating';
    }
    return report.status;
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
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">管理后台</h1>
          <p className="text-gray-600">八字命理报告管理系统</p>
        </div>

        {/* Stats - 可点击筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setStatusFilter('all')}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition hover:shadow-md ${
              statusFilter === 'all' ? 'border-blue-500' : 'border-gray-100'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">总报告数</div>
            <div className="text-3xl font-semibold text-gray-900">{reports.length}</div>
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition hover:shadow-md ${
              statusFilter === 'published' ? 'border-green-500' : 'border-gray-100'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">已发布</div>
            <div className="text-3xl font-semibold text-green-600">
              {getStatusCount('published')}
            </div>
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition hover:shadow-md ${
              statusFilter === 'draft' ? 'border-yellow-500' : 'border-gray-100'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">草稿</div>
            <div className="text-3xl font-semibold text-yellow-600">
              {getStatusCount('draft')}
            </div>
          </button>
          <button
            onClick={() => setStatusFilter('generating')}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition hover:shadow-md ${
              statusFilter === 'generating' ? 'border-blue-500' : 'border-gray-100'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">生成中</div>
            <div className="text-3xl font-semibold text-blue-600">
              {getStatusCount('generating')}
            </div>
          </button>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">报告列表</h2>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {statusFilter === 'all' ? '暂无报告' : `暂无${
                statusFilter === 'published' ? '已发布' :
                statusFilter === 'draft' ? '草稿' : '生成中'
              }报告`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">性别</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">出生日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">城市</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">八字</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => {
                    const actualStatus = getReportStatus(report);
                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.gender === 'male' ? '男' : '女'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.birthDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                          {report.baziYear} {report.baziMonth}<br/>
                          {report.baziDay} {report.baziHour}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            actualStatus === 'published'
                              ? 'bg-green-100 text-green-700'
                              : actualStatus === 'generating'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {actualStatus === 'published' ? '已发布' : actualStatus === 'generating' ? '生成中' : '草稿'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                          {new Date(report.createdAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/reports/${report.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            编辑
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
