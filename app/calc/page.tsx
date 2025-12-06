'use client';

import { useState } from 'react';
import { searchCities, type City } from '@/lib/cities';

export default function CalcPage() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    birthTime: '',
    city: '',
  });

  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(false);

  // 城市搜索
  const handleCitySearch = (query: string) => {
    setCitySearch(query);
    if (query.length > 0) {
      const results = searchCities(query, 5);
      setCitySuggestions(results);
    } else {
      setCitySuggestions([]);
    }
  };

  // 选择城市
  const selectCity = (city: City) => {
    setSelectedCity(city);
    setCitySearch(city.name);
    setCitySuggestions([]);
    setFormData({ ...formData, city: city.name });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCity) {
      alert('请从列表中选择城市');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          city: formData.city,
          longitude: selectedCity?.longitude,
          latitude: selectedCity?.latitude,
        }),
      });

      if (!response.ok) throw new Error('创建报告失败');

      const report = await response.json();
      window.location.href = `/reports/${report.id}`;
    } catch (error) {
      console.error('错误:', error);
      alert('创建报告失败，请重试。');
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
          <h1 className="text-2xl font-medium text-gray-900 mb-2">八字命理测算</h1>
          <p className="text-sm text-gray-500 mb-8">请输入您的出生信息进行命理分析</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 姓名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="请输入姓名"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* 性别 */}
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

            {/* 出生日期 */}
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

            {/* 出生时间 */}
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

            {/* 出生城市（带自动补全） */}
            <div className="relative">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                出生城市
              </label>
              <input
                type="text"
                id="city"
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                required
                placeholder="例如：北京、上海"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />

              {/* 城市建议列表 */}
              {citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {citySuggestions.map((city) => (
                    <div
                      key={city.name}
                      onClick={() => selectCity(city)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-xs text-gray-500">{city.province}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCity && (
                <p className="mt-2 text-xs text-gray-500">
                  已选择：{selectedCity.name}（将使用真太阳时计算）
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '测算中...' : '开始测算'}
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
