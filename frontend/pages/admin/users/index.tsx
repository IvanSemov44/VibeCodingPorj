import React, { useState } from 'react';
import { useGetAdminUsersQuery } from '../../../store/domains';

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
          className="border px-2 py-1 rounded"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => setPage(1)}
        >
          Search
        </button>
      </div>

      {isLoading && <div>Loading users…</div>}
      {isError && <div className="text-red-600">Failed to load users</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Roles</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-600">
                  No users found
                </td>
              </tr>
            )}
            {users.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{(u.roles || []).map((r: any) => r.name).join(', ')}</td>
                <td className="p-2">{u.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          className="px-3 py-1 border rounded"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={meta.current_page <= 1}
        >
          Previous
        </button>
        <div>Page {meta.current_page || page} of {meta.last_page || '-'}</div>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => setPage((p) => p + 1)}
          disabled={meta.current_page >= meta.last_page}
        >
          Next
        </button>
      </div>
    </div>
  );
}
