'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalcPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    gender: 'male',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock basic calculation
      const basicSummary = generateMockBaziSummary(formData);

      // Create draft report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `八字分析 - ${formData.birthDate}`,
          basicSummary,
          formJson: JSON.stringify(formData),
          status: 'draft',
        }),
      });

      if (!response.ok) throw new Error('创建报告失败');

      const report = await response.json();

      // Show result with admin link
      alert(`报告已创建！\n\n基础分析：\n${basicSummary}\n\n在管理后台打开：/admin/reports/${report.id}`);

      // Optionally redirect
      // router.push(`/admin/reports/${report.id}`);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(
        `创建报告失败。\n\n` +
        `错误：${errorMessage}\n\n` +
        `请确保已设置数据库：\n` +
        `1. 运行：npm run prisma:generate\n` +
        `2. 运行：npm run db:push\n` +
        `3. 或运行：node scripts/init-db.js\n` +
        `4. 重启开发服务器`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">八字命理分析</h1>
          <p className="text-sm text-gray-500 mb-8">请输入您的出生信息进行测算</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                出生日期
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700 mb-2">
                出生时间
              </label>
              <input
                type="time"
                id="birthTime"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                出生地点
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="例如：北京市"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '计算中...' : '开始测算'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

// Mock BaZi calculation function
function generateMockBaziSummary(data: { birthDate: string; birthTime: string; gender: string; location: string }) {
  const elements = ['木', '火', '土', '金', '水'];
  const dayMaster = elements[Math.floor(Math.random() * elements.length)];
  const luckyElement = elements[Math.floor(Math.random() * elements.length)];

  return `日主：${dayMaster}
喜用神：${luckyElement}
出生日期：${data.birthDate}
出生时间：${data.birthTime}
出生地点：${data.location}

这是模拟分析结果。完整报告可以在管理后台进行编辑。`;
}
