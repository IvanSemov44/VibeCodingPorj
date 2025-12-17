import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useGetActivitiesQuery, useGetActivityStatsQuery } from '../../store/domains';

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
        <div className="flex justify-end mb-4">
          <button
            onClick={exportToCSV}
            disabled={activities.length === 0}
            className="px-4 py-2 bg-[var(--success)] text-white rounded-md hover:bg-[var(--success-hover)] disabled:bg-[var(--secondary-bg)] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--success)]"
          >
            📥 Export to CSV
          </button>
        </div>

        {/* Activity Table */}
        <div className="bg-[var(--card-bg)] rounded-lg shadow overflow-hidden border border-[var(--border-color)]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--border-color)] border-t-[var(--accent)]"></div>
              <p className="mt-2 text-[var(--text-secondary)]">Loading activities...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-[var(--danger)]">{error.message}</div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">No activities found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border-color)]">
                  <thead className="bg-[var(--secondary-bg)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-[var(--secondary-bg)]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          #{activity.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{new Date(activity.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{activity.created_at_human}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.user ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{activity.user.name}</div>
                              <div className="text-xs text-gray-500">{activity.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(
                              activity.action
                            )}`}
                          >
                            {activity.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{activity.subject_type.split('\\').pop()}</div>
                          <div className="text-xs text-gray-500">ID: {activity.subject_id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {activity.meta && Object.keys(activity.meta).length > 0 ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800">View details</summary>
                              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                                {JSON.stringify(activity.meta, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-[var(--card-bg)] px-4 py-3 flex items-center justify-between border-t border-[var(--border-color)] sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:bg-[var(--secondary-bg)] disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:bg-[var(--secondary-bg)] disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:bg-[var(--secondary-bg)] disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:bg-[var(--secondary-bg)] disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
