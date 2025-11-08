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
          title: `BaZi Analysis - ${formData.birthDate}`,
          basicSummary,
          formJson: JSON.stringify(formData),
          status: 'draft',
        }),
      });

      if (!response.ok) throw new Error('Failed to create report');

      const report = await response.json();

      // Show result with admin link
      alert(`Report created!\n\nBasic Summary:\n${basicSummary}\n\nOpen in Admin: /admin/reports/${report.id}`);

      // Optionally redirect
      // router.push(`/admin/reports/${report.id}`);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(
        `Failed to create report.\n\n` +
        `Error: ${errorMessage}\n\n` +
        `Make sure you've set up the database:\n` +
        `1. Run: npm run prisma:generate\n` +
        `2. Run: npm run db:push\n` +
        `3. Restart the dev server`
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
          <h1 className="text-2xl font-medium text-gray-900 mb-2">BaZi Life Analysis</h1>
          <p className="text-sm text-gray-500 mb-8">Enter your birth details for analysis</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date
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
                Birth Time
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
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Birth Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Beijing, China"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate BaZi'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

// Mock BaZi calculation function
function generateMockBaziSummary(data: typeof formData) {
  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const dayMaster = elements[Math.floor(Math.random() * elements.length)];
  const luckyElement = elements[Math.floor(Math.random() * elements.length)];

  return `Day Master: ${dayMaster}
Lucky Element: ${luckyElement}
Birth Date: ${data.birthDate}
Birth Time: ${data.birthTime}
Location: ${data.location}

This is a mock analysis. The full report can be edited in the admin panel.`;
}
