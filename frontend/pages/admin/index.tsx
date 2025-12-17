import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useGetAdminStatsQuery, useGetCategoriesQuery, useGetTagsQuery } from '../../store/domains';
import StatsCard from '../../components/admin/StatsCard';
import RecentActivity from '../../components/admin/RecentActivity';
import SystemHealthCard from '../../components/admin/SystemHealthCard';
import { SkeletonCard } from '../../components/Loading/SkeletonCard';

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
    <AdminLayout title="Admin Dashboard" description="Overview of site activity and management.">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="Total Tools" value={stats.totalTools} href="/admin/tools" />
          <StatsCard title="Pending Approval" value={stats.pendingTools} href="/admin/tools?status=pending" />
          <StatsCard title="Active Users" value={stats.activeUsers} href="/admin/users" />
          <StatsCard title="Categories" value={totalCategories} href="/admin/categories" />
          <StatsCard title="Tags" value={totalTags} href="/admin/tags" />
        </div>
      )}

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* <div className="lg:col-span-2">
              {isLoading ? <SkeletonCard /> : <RecentActivity />}
            </div> */}
            <div className="">
              {isLoading ? <SkeletonCard /> : <SystemHealthCard />}
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}
