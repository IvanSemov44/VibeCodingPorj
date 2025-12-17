import AdminLayout from '../../components/admin/AdminLayout';
import { useState } from 'react';
import { useToast } from '../../components/Toast';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api/fetch';

interface AnalyticsData {
  total_views: number;
  total_tools: number;
  unique_viewers: number;
  most_viewed: Array<{ tool_id: number; tool_name: string; tool_slug: string; views: number }>;
  trending_tools: Array<{
    tool_id: number;
    tool: { id: number; name: string; slug: string };
    this_week_views: number;
    growth_percentage: number;
  }>;
  views_by_date: Record<string, number>;
  referrers: Array<{ referer: string; views: number }>;
  period_days: number;
}

export default function AnalyticsDashboard() {
  const { addToast } = useToast();
  const [period, setPeriod] = useState('7');
  const [toolFilter, setToolFilter] = useState('');

  const { data: analytics, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'analytics', period],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/admin/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      return response.json() as Promise<AnalyticsData>;
    },
  });

  // Limit views to last 10 days
  const lastTenDays = analytics
    ? Object.fromEntries(Object.entries(analytics.views_by_date).slice(-10))
    : {};

  const handleExport = async () => {
    if (!analytics) return;

    try {
      let csvContent = 'Date,Views\n';
      Object.entries(analytics.views_by_date).forEach(([date, views]) => {
        csvContent += `${date},${views}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${period}days-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      addToast('📥 Analytics exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export analytics', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--accent)' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !analytics) {
    return (
      <AdminLayout>
        <div className="text-center" style={{ color: 'var(--danger)' }}>
          Failed to load analytics: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              📊 Analytics Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
              Tool engagement and performance metrics
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border transition-all"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard label="Total Views" value={analytics.total_views.toLocaleString()} icon="👁️" color="#3b82f6" />
          <MetricCard label="Unique Viewers" value={analytics.unique_viewers.toLocaleString()} icon="👥" color="#10b981" />
          <MetricCard label="Total Tools" value={analytics.total_tools.toString()} icon="🛠️" color="#a855f7" />
          <MetricCard
            label="Avg Views/Tool"
            value={analytics.total_tools > 0 ? Math.round(analytics.total_views / analytics.total_tools).toString() : '0'}
            icon="📈"
            color="#f59e0b"
          />
        </div>

        {/* Most Viewed Tools */}
        <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            🏆 Top 10 Most Viewed Tools
          </h2>

          {/* Filter Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by tool name..."
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border transition-all"
              style={{
                backgroundColor: 'var(--secondary-bg)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottomColor: 'var(--border-color)' }} className="border-b">
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Tool
                  </th>
                  <th className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Views
                  </th>
                  <th className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.most_viewed
                  .filter((tool) => tool.tool_name.toLowerCase().includes(toolFilter.toLowerCase()))
                  .map((tool, idx) => (
                    <tr
                      key={tool.tool_id}
                      style={{
                        borderBottomColor: 'var(--border-color)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--secondary-bg)',
                      }}
                      className="border-b hover:opacity-75 transition-opacity"
                    >
                      <td className="py-3 px-4">
                        <a
                          href={`/admin/tools/${tool.tool_slug}`}
                          className="font-medium transition-colors"
                          style={{ color: 'var(--accent)' }}
                        >
                          {tool.tool_name}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right" style={{ color: 'var(--text-primary)' }}>
                        {tool.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>
                        {analytics.total_views > 0 ? ((tool.views / analytics.total_views) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trending Tools & Top Referrers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trending Tools */}
          <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔥 Trending Tools
            </h2>
            <div className="space-y-3">
              {analytics.trending_tools.length > 0 ? (
                analytics.trending_tools.map((tool) => (
                  <div
                    key={tool.tool_id}
                    className="flex justify-between items-center p-3 rounded transition-all"
                    style={{ backgroundColor: 'var(--secondary-bg)' }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {tool.tool.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {tool.this_week_views} views this week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                        +{tool.growth_percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No trending tools</p>
              )}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔗 Top Referrers
            </h2>
            <div className="space-y-3">
              {analytics.referrers.length > 0 ? (
                analytics.referrers.map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded"
                    style={{ backgroundColor: 'var(--secondary-bg)' }}
                  >
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {ref.referer || 'Direct'}
                    </p>
                    <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {ref.views.toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No referrer data</p>
              )}
            </div>
          </div>
        </div>

        {/* Views Over Time - Limited to Last 10 Days */}
        <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📈 Views Over Time (Last 10 Days)
          </h2>
          <div className="space-y-3">
            {Object.entries(lastTenDays).length > 0 ? (
              Object.entries(lastTenDays).map(([date, views]) => {
                const maxViews = Math.max(...Object.values(lastTenDays));
                const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
                return (
                  <div key={date} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {date}
                    </div>
                    <div
                      className="flex-1 rounded h-8 relative overflow-hidden transition-all"
                      style={{ backgroundColor: 'var(--secondary-bg)' }}
                    >
                      {percentage > 0 && (
                        <div
                          className="h-full transition-all duration-300 flex items-center px-2"
                          style={{
                            width: `${Math.max(percentage, 5)}%`,
                            background: `linear-gradient(90deg, var(--accent), ${percentage > 50 ? 'var(--success)' : 'var(--accent)'})`,
                          }}
                        >
                          <span className="text-white text-xs font-bold whitespace-nowrap">{views}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-20 text-right text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {views.toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No data available for the last 10 days</p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div
          className="rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ backgroundColor: 'var(--secondary-bg)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Time Period
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {analytics.period_days} days
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Average Daily Views
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {analytics.period_days > 0
                ? Math.round(analytics.total_views / analytics.period_days).toLocaleString()
                : 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Engagement Rate
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {analytics.total_tools > 0 ? ((analytics.unique_viewers / analytics.total_tools) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper Component for Metric Cards
function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div
      className="rounded-lg p-6 shadow transition-transform hover:scale-105"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>
            {value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
