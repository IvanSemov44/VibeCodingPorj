'use client';

import AdminLayout from '../../components/admin/AdminLayout';
import { useState } from 'react';
import { useToast } from '../../components/Toast';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api/fetch';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components only once
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
}

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
          {/* Trending Tools Chart */}
          <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔥 Trending Tools
            </h2>
            {analytics.trending_tools.length > 0 ? (
              <Bar
                data={{
                  labels: analytics.trending_tools.map((t) => t.tool.name),
                  datasets: [
                    {
                      label: 'Growth %',
                      data: analytics.trending_tools.map((t) => t.growth_percentage),
                      backgroundColor: '#10b981',
                      borderColor: '#059669',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `+${(context.parsed.x ?? 0).toFixed(1)}%`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: 'var(--text-secondary)' },
                      grid: { color: 'var(--border-color)' },
                    },
                    y: {
                      ticks: { color: 'var(--text-primary)' },
                      grid: { display: false },
                    },
                  },
                }}
              />
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No trending tools</p>
            )}
          </div>

          {/* Top Referrers Chart */}
          <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔗 Top Referrers
            </h2>
            {analytics.referrers.length > 0 ? (
              <Bar
                data={{
                  labels: analytics.referrers.map((r) => {
                    if (!r.referer) return 'Direct';
                    try {
                      return new URL(r.referer).hostname;
                    } catch {
                      return r.referer.substring(0, 30); // Fallback: truncate the string
                    }
                  }),
                  datasets: [
                    {
                      label: 'Views',
                      data: analytics.referrers.map((r) => r.views),
                      backgroundColor: '#3b82f6',
                      borderColor: '#1d4ed8',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: 'var(--text-secondary)' },
                      grid: { color: 'var(--border-color)' },
                    },
                    y: {
                      ticks: { color: 'var(--text-primary)' },
                      grid: { display: false },
                    },
                  },
                }}
              />
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No referrer data</p>
            )}
          </div>
        </div>

        {/* Views Over Time - Line Chart - Last 10 Days */}
        <div className="rounded-lg p-6 shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📈 Views Over Time (Last 10 Days)
          </h2>
          {Object.entries(lastTenDays).length > 0 ? (
            <Line
              data={{
                labels: Object.keys(lastTenDays),
                datasets: [
                  {
                    label: 'Daily Views',
                    data: Object.values(lastTenDays),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: true,
                    labels: { color: 'var(--text-primary)' },
                  },
                  tooltip: {
                    backgroundColor: 'var(--secondary-bg)',
                    titleColor: 'var(--text-primary)',
                    bodyColor: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                    borderWidth: 1,
                  },
                },
                scales: {
                  x: {
                    ticks: { color: 'var(--text-primary)' },
                    grid: { color: 'var(--border-color)' },
                  },
                  y: {
                    ticks: { color: 'var(--text-primary)' },
                    grid: { color: 'var(--border-color)' },
                    beginAtZero: true,
                  },
                },
              }}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No data available for the last 10 days</p>
          )}
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
