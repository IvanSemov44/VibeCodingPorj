import React from 'react';
import { useGetAdminStatsQuery, useGetCategoriesQuery, useGetTagsQuery } from '../../store/domains';
import StatsCard from '../../components/admin/StatsCard';
import RecentActivity from '../../components/admin/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
// AdminGuard removed: server-side middleware enforces access

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStatsQuery();
  const stats: any = data ?? {};
  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: tagsRes } = useGetTagsQuery();
  const totalCategories =
    stats.totalCategories ?? (Array.isArray(categoriesRes) ? categoriesRes.length : (categoriesRes && (categoriesRes as any).data ? (categoriesRes as any).data.length : undefined)) ?? 0;
  const totalTags =
    stats.totalTags ?? (Array.isArray(tagsRes) ? tagsRes.length : (tagsRes && (tagsRes as any).data ? (tagsRes as any).data.length : undefined)) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {isLoading && <div>Loading stats…</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Tools" value={stats.totalTools} href="/admin/tools" />
        <StatsCard title="Pending Approval" value={stats.pendingTools} href="/admin/tools?status=pending" />
        <StatsCard title="Active Users" value={stats.activeUsers} href="/admin/users" />
        <StatsCard title="Categories" value={totalCategories} href="/admin/categories" />
        <StatsCard title="Tags" value={totalTags} href="/admin/tags" />
      </div>
      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
