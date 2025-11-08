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
      alert('Invalid password');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load report');
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

      if (!response.ok) throw new Error('Failed to save report');

      alert('Report saved successfully!');
      await fetchReport(); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save report');
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

      if (!response.ok) throw new Error('Failed to publish report');

      alert('Report published successfully!');
      await fetchReport();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to publish report');
    }
  };

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">Admin Access</h1>
            <p className="text-sm text-gray-500 mb-6">Enter password to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
              >
                Login
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
        <div className="text-gray-500">Loading report...</div>
      </div>
    );
  }

  // No report found
  if (!report) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">Report not found</div>
      </div>
    );
  }

  // Admin editor
  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-gray-900">Edit Report</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                report.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {report.status}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
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
                Basic Summary
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
                Full Content (Markdown)
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
                <div className="text-xs text-gray-500">Created</div>
                <div className="text-sm text-gray-700 mt-1">
                  {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Updated</div>
                <div className="text-sm text-gray-700 mt-1">
                  {new Date(report.updatedAt).toLocaleString()}
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {report.status !== 'published' && (
                <button
                  onClick={handlePublish}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition"
                >
                  Publish Report
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/calc" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← Back to Calculator
          </a>
        </div>
      </div>
    </div>
  );
}
