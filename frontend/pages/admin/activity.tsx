import { useState, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ActivityStats from '../../components/admin/ActivityStats';
import ActivityFilters from '../../components/admin/ActivityFilters';
import ExportButtons from '../../components/admin/ExportButtons';
import ActivityList from '../../components/admin/ActivityList';
import ActivityCard from '../../components/admin/ActivityCard';
import PaginationControls from '../../components/admin/PaginationControls';
import { useGetActivitiesQuery, useGetActivityStatsQuery } from '../../store/domains';
import { useActivityExport } from '../../hooks/useActivityExport';
import { PER_PAGE } from '../../lib/activityConstants';

interface ActivityStats {
  total: number;
  today: number;
  this_week: number;
  top_actions: Array<{ action: string; count: number }>;
  activity_by_day: Array<{ date: string; count: number }>;
}

export default function ActivityLogPage() {
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    subject_type: '',
    user_id: '',
    date_from: '',
    date_to: '',
    search: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Custom hook for exports
  const { isExporting, handleExportToServer, exportToCSV } = useActivityExport();

  // Memoize query params to prevent unnecessary re-renders
  const params = useMemo<Record<string, unknown>>(
    () => ({
      page: currentPage,
      per_page: PER_PAGE,
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
    }),
    [currentPage, filters]
  );

  // Fetch data using React Query
  const { data, isLoading, error } = useGetActivitiesQuery(params);
  const { data: stats } = useGetActivityStatsQuery();

  const activities = data?.data || [];
  const totalPages = data?.last_page || 1;

  // Memoized handlers
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      action: '',
      subject_type: '',
      user_id: '',
      date_from: '',
      date_to: '',
      search: '',
    });
    setCurrentPage(1);
  }, []);

  const handleExportServerClick = useCallback(() => {
    handleExportToServer(filters);
  }, [filters, handleExportToServer]);

  const handleExportCSVClick = useCallback(() => {
    exportToCSV(activities);
  }, [activities, exportToCSV]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  return (
    <AdminLayout title="Activity Logs" description="Monitor all user actions and system events">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        {stats && (
          <ActivityStats
            total={stats.total}
            today={stats.today}
            thisWeek={stats.this_week}
            topAction={stats.top_actions[0]}
          />
        )}

        {/* Filters */}
        <ActivityFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Export Button */}
        <ExportButtons
          isExporting={isExporting}
          hasActivities={activities.length > 0}
          onExportToServer={handleExportServerClick}
          onExportToCSV={handleExportCSVClick}
        />

        {/* Activity List (Card View) */}
        <ActivityList isLoading={isLoading} error={error} activities={activities}>
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        </ActivityList>
      </div>
    </AdminLayout>
  );
}
