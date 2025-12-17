import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useGetActivitiesQuery, useGetActivityStatsQuery } from '../../store/domains';
import { useToast } from '../../components/Toast';

interface Activity {
  id: number;
  subject_type: string;
  subject_id: number;
  action: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles?: string[];
  } | null;
  meta: Record<string, any> | null;
  created_at: string;
  created_at_human: string;
}

interface ActivityStats {
  total: number;
  today: number;
  this_week: number;
  top_actions: Array<{ action: string; count: number }>;
  activity_by_day: Array<{ date: string; count: number }>;
}

export default function ActivityLogPage() {
  const { addToast } = useToast();

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
  const [perPage] = useState(20);
  const [isExporting, setIsExporting] = useState(false);

  // Build query params
  const params: Record<string, unknown> = {
    page: currentPage,
    per_page: perPage,
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    ),
  };

  // Fetch data using React Query
  const { data, isLoading, error } = useGetActivitiesQuery(params);
  const { data: stats } = useGetActivityStatsQuery();

  const activities = data?.data || [];
  const totalPages = data?.last_page || 1;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via React Query
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      subject_type: '',
      user_id: '',
      date_from: '',
      date_to: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const handleExportToServer = async () => {
    try {
      setIsExporting(true);

      const response = await fetch('/api/admin/activities/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(filters),
      });

      if (response.status === 202) {
        addToast('✅ Export started! Check your email for the download link.', 'success');
      } else if (response.status === 401) {
        addToast('Unauthorized. Please login again.', 'error');
      } else if (response.status === 403) {
        addToast('You do not have permission to export data.', 'error');
      } else {
        const error = await response.json();
        addToast(error.message || 'Export failed', 'error');
      }
    } catch (err) {
      addToast('Export error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'User', 'Action', 'Subject Type', 'Subject ID', 'Details'];
    const rows = activities.map((activity) => [
      activity.id,
      activity.created_at,
      activity.user?.name || 'System',
      activity.action,
      activity.subject_type,
      activity.subject_id,
      JSON.stringify(activity.meta || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      deleted: 'bg-red-100 text-red-800',
      approved: 'bg-purple-100 text-purple-800',
      rejected: 'bg-orange-100 text-orange-800',
      login: 'bg-cyan-100 text-cyan-800',
      logout: 'bg-gray-100 text-gray-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Activity Logs" description="Monitor all user actions and system events">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
              <div className="text-sm font-medium text-[var(--text-secondary)]">Total Activities</div>
              <div className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{stats.total.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
              <div className="text-sm font-medium text-[var(--text-secondary)]">Today</div>
              <div className="mt-2 text-3xl font-bold text-[var(--accent)]">{stats.today}</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
              <div className="text-sm font-medium text-[var(--text-secondary)]">This Week</div>
              <div className="mt-2 text-3xl font-bold text-[var(--success)]">{stats.this_week}</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
              <div className="text-sm font-medium text-[var(--text-secondary)]">Top Action</div>
              <div className="mt-2 text-lg font-bold text-[var(--accent)]">
                {stats.top_actions[0]?.action || 'N/A'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{stats.top_actions[0]?.count || 0} times</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 mb-6 border border-[var(--border-color)]">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search actions, types..."
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Subject Type</label>
              <select
                value={filters.subject_type}
                onChange={(e) => handleFilterChange('subject_type', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              >
                <option value="">All Types</option>
                <option value="Tool">Tool</option>
                <option value="User">User</option>
                <option value="Category">Category</option>
                <option value="Tag">Tag</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-md hover:bg-[var(--tertiary-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--border-color)]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={handleExportToServer}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {isExporting ? '⏳ Exporting...' : '📧 Export & Email (Large)'}
          </button>
          <button
            onClick={exportToCSV}
            disabled={activities.length === 0}
            className="px-4 py-2 bg-[var(--success)] text-white rounded-md hover:bg-[var(--success-hover)] disabled:bg-[var(--secondary-bg)] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--success)]"
          >
            📥 Download Now (Current Page)
          </button>
        </div>

        {/* Activity List (Card View) */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--border-color)] border-t-[var(--accent)]"></div>
              <p className="mt-2 text-[var(--text-secondary)]">Loading activities...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error.message}</div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
              No activities found
            </div>
          ) : (
            <>
              {/* Activity Cards */}
              {activities.map((activity) => {
                const subject = activity.subject_type.split('\\').pop();
                const actionColor = getActionBadgeColor(activity.action);

                return (
                  <div
                    key={activity.id}
                    className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                      {/* ID */}
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">ID</p>
                        <p className="text-lg font-mono font-bold text-[var(--accent)]">#{activity.id}</p>
                      </div>

                      {/* Date & Time */}
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">Date & Time</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {new Date(activity.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{activity.created_at_human}</p>
                      </div>

                      {/* User & Email */}
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">User</p>
                        {activity.user ? (
                          <>
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{activity.user.name}</p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{activity.user.email}</p>
                          </>
                        ) : (
                          <p className="text-sm text-[var(--text-secondary)]">System</p>
                        )}
                      </div>

                      {/* Action */}
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">Action</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${actionColor}`}>
                          {activity.action}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">Subject</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{subject}</p>
                        <p className="text-xs text-[var(--text-secondary)]">ID: {activity.subject_id}</p>
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">Details</p>
                        {activity.meta && Object.keys(activity.meta).length > 0 ? (
                          <details className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
                            <summary className="font-medium">View details</summary>
                            <div className="mt-3 p-3 bg-[var(--primary-bg)] rounded border border-[var(--border-color)] overflow-auto max-h-48">
                              <pre className="text-xs whitespace-pre-wrap break-words">
                                {JSON.stringify(activity.meta, null, 2)}
                              </pre>
                            </div>
                          </details>
                        ) : (
                          <p className="text-sm text-[var(--text-secondary)]">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
                <div className="text-sm text-[var(--text-primary)]">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
