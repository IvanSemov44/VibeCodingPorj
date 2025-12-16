import React from 'react';
import Layout from '../../components/Layout';
import { useGetAdminStatsQuery } from '../../store/domains';
import StatsCard from '../../components/admin/StatsCard';

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStatsQuery();
  const stats: any = data ?? {};

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {isLoading && <div>Loading stats…</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Tools" value={stats.totalTools} />
        <StatsCard title="Pending Approval" value={stats.pendingTools} />
        <StatsCard title="Active Users" value={stats.activeUsers} />
      </div>
    </Layout>
  );
}
