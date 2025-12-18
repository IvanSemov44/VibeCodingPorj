import React from 'react';
import type { AdminStats } from '../../store/domains/admin/stats';
import { useGetAdminStatsQuery } from '../../store/domains';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import SystemHealthCard from '../../components/admin/SystemHealthCard';
import { SkeletonCard } from '../../components/Loading/SkeletonCard';

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStatsQuery();
  const stats = data as AdminStats | undefined;

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
          <StatsCard title="Total Tools" value={stats?.totalTools} href="/admin/tools" />
          <StatsCard
            title="Pending Approval"
            value={stats?.pendingTools}
            href="/admin/tools?status=pending"
          />
          <StatsCard title="Active Users" value={stats?.activeUsers} href="/admin/users" />
          <StatsCard title="Categories" value={stats?.totalCategories} href="/admin/categories" />
          <StatsCard title="Tags" value={stats?.totalTags} href="/admin/tags" />
        </div>
      )}

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="">{isLoading ? <SkeletonCard /> : <SystemHealthCard />}</div>
        </div>
      </div>
    </AdminLayout>
  );
}
