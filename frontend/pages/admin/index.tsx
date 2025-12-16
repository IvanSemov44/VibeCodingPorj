import React from 'react';
import { useGetAdminStatsQuery } from '../../store/domains';
import StatsCard from '../../components/admin/StatsCard';
import AdminGuard from '../../components/admin/AdminGuard';

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStatsQuery();
  const stats: any = data ?? {};

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {isLoading && <div>Loading stats…</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total Tools" value={stats.totalTools} href="/admin/tools" />
          <StatsCard title="Pending Approval" value={stats.pendingTools} href="/admin/tools?status=pending" />
          <StatsCard title="Active Users" value={stats.activeUsers} href="/admin/users" />
        </div>
      </div>
    </AdminGuard>
  );
}
