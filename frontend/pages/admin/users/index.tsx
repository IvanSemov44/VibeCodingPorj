import React, { useState } from 'react';
import { useGetAdminUsersQuery } from '../../../store/domains';
// AdminGuard removed: rely on Next middleware for server-side protection

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');

  const params: Record<string, unknown> = { page, per_page: perPage };
  if (search) params.search = search;

  const { data, isLoading, isError } = useGetAdminUsersQuery(params, { keepPreviousData: true });

  const users = (data && (data as any).data) || [];
  const meta = (data && (data as any).meta) || {};

  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Active Users</h1>

      <div className="mb-4 flex gap-2">
        <input
          className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="px-3 py-1 rounded bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
          onClick={() => setPage(1)}
        >
          Search
        </button>
      </div>

      {isLoading && <div>Loading users…</div>}
      {isError && <div className="text-[var(--danger)]">Failed to load users</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
          <thead>
            <tr>
              <th className="p-2 text-left text-[var(--text-secondary)]">Name</th>
              <th className="p-2 text-left text-[var(--text-secondary)]">Email</th>
              <th className="p-2 text-left text-[var(--text-secondary)]">Roles</th>
              <th className="p-2 text-left text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-[var(--text-secondary)]">
                  No users found
                </td>
              </tr>
            )}
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-[var(--border-color)]">
                <td className="p-2 text-[var(--text-primary)]">{u.name}</td>
                <td className="p-2 text-[var(--text-primary)]">{u.email}</td>
                <td className="p-2 text-[var(--text-primary)]">{(u.roles || []).map((r: any) => r?.name).filter(Boolean).join(', ')}</td>
                <td className="p-2 text-[var(--text-primary)]">{u.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          className="px-3 py-1 border border-[var(--border-color)] rounded bg-[var(--primary-bg)] text-[var(--text-primary)] disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={(meta.current_page || page) <= 1}
        >
          Previous
        </button>
        <div className="text-[var(--text-primary)]">Page {meta.current_page || page} of {meta.last_page || '-'}</div>
        <button
          className="px-3 py-1 border border-[var(--border-color)] rounded bg-[var(--primary-bg)] text-[var(--text-primary)] disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={meta.current_page >= (meta.last_page || 0)}
        >
          Next
        </button>
      </div>
      </div>
  );
}
