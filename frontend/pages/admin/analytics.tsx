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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !analytics) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600">
          Failed to load analytics: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-semibold text-gray-600">Total Views</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{analytics.total_views.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-semibold text-gray-600">Unique Viewers</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{analytics.unique_viewers.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-semibold text-gray-600">Total Tools</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">{analytics.total_tools}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-semibold text-gray-600">Avg Views/Tool</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">
              {analytics.total_tools > 0 ? Math.round(analytics.total_views / analytics.total_tools) : 0}
            </div>
          </div>
        </div>

        {/* Most Viewed Tools */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Top 10 Most Viewed Tools</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Tool</th>
                  <th className="text-right py-3 px-4 font-semibold">Views</th>
                  <th className="text-right py-3 px-4 font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {analytics.most_viewed.map((tool) => (
                  <tr key={tool.tool_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a
                        href={`/admin/tools/${tool.tool_slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {tool.tool_name}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{tool.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {analytics.total_views > 0
                        ? ((tool.views / analytics.total_views) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trending Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🔥 Trending Tools</h2>
            <div className="space-y-3">
              {analytics.trending_tools.length > 0 ? (
                analytics.trending_tools.map((tool) => (
                  <div key={tool.tool_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{tool.tool.name}</p>
                      <p className="text-sm text-gray-600">{tool.this_week_views} views this week</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{tool.growth_percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No trending tools</p>
              )}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Top Referrers</h2>
            <div className="space-y-3">
              {analytics.referrers.length > 0 ? (
                analytics.referrers.map((ref, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{ref.referer}</p>
                    </div>
                    <p className="text-gray-600">{ref.views.toLocaleString()} views</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No referrer data</p>
              )}
            </div>
          </div>
        </div>

        {/* Views Over Time Chart (text-based visualization) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Views Over Time</h2>
          <div className="space-y-2">
            {Object.entries(analytics.views_by_date).map(([date, views]) => {
              const maxViews = Math.max(...Object.values(analytics.views_by_date));
              const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
              return (
                <div key={date} className="flex items-center gap-2">
                  <div className="w-20 text-sm font-medium text-gray-600">{date}</div>
                  <div className="flex-1 bg-gray-100 rounded h-6 relative overflow-hidden">
                    {percentage > 0 && (
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-white text-xs font-semibold px-1 py-1">
                          {views > 0 ? views : ''}
                        </span>
                      </div>
                    )}
                    {percentage === 0 && <span className="text-xs text-gray-400 px-2 py-1">0</span>}
                  </div>
                  <div className="w-16 text-right text-sm font-medium">{views.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
