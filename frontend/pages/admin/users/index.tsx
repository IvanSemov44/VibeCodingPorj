import React, { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Pagination from '../../../components/admin/Pagination';
import { ConfirmationModal } from '../../../components/admin/ConfirmationModal';
import type { AdminUser } from '@/lib/types';
import {
  useGetAdminUsersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetRolesQuery,
  useSetUserRolesMutation,
} from '../../../store/domains';
import { useToast } from '../../../components/Toast';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');

  const params: Record<string, unknown> = { page, per_page: perPage };
  if (search) params.search = search;

  const { data, isLoading, isError } = useGetAdminUsersQuery(params, { keepPreviousData: true });

  const users = (data?.data) || [];
  const meta = (data?.meta) || {};
  const { data: rolesList } = useGetRolesQuery();
  const [activateTrigger, activateMutation] = useActivateUserMutation();
  const [deactivateTrigger, deactivateMutation] = useDeactivateUserMutation();
  const [setRolesTrigger, setRolesMutation] = useSetUserRolesMutation();
  const { addToast } = useToast();
  const [roleChangePending, setRoleChangePending] = useState<null | {
    userId: number | string;
    userName?: string;
    newRoleId?: number | string;
    newRoleName?: string;
  }>(null);
  const [confirmAction, setConfirmAction] = useState<null | {
    type: 'activate' | 'deactivate';
    userId: number | string;
    userName?: string;
  }>(null);

  return (
    <AdminLayout title="User Management" description="Manage user accounts, roles, and permissions">
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
            {users.map((u: AdminUser) => (
              <tr key={u.id} className="border-t border-[var(--border-color)]">
                <td className="p-2 text-[var(--text-primary)]">{u.name}</td>
                <td className="p-2 text-[var(--text-primary)]">{u.email}</td>
                <td className="p-2 text-[var(--text-primary)]">
                  <select
                    className="p-1 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded"
                    value={
                      u.roles && u.roles[0]
                        ? typeof u.roles[0] === 'string'
                          ? u.roles[0]
                          : String(u.roles[0].id)
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      const role = Array.isArray(rolesList)
                        ? rolesList.find((rr) => String(rr.id) === val)
                        : null;
                      setRoleChangePending({
                        userId: u.id,
                        userName: u.name,
                        newRoleId: val ? Number(val) : undefined,
                        newRoleName: role?.name,
                      });
                    }}
                  >
                    <option value="">(none)</option>
                    {Array.isArray(rolesList) &&
                      rolesList.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="p-2 text-[var(--text-primary)]">
                  {u.is_active ? (
                    <button
                      className="px-2 py-1 bg-[var(--danger)] text-white rounded"
                      onClick={() =>
                        setConfirmAction({ type: 'deactivate', userId: u.id, userName: u.name })
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 bg-[var(--success)] text-white rounded"
                      onClick={() =>
                        setConfirmAction({ type: 'activate', userId: u.id, userName: u.name })
                      }
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={meta.current_page || page}
        lastPage={meta.last_page || 1}
        total={meta.total}
        perPage={perPage}
        onPageChange={setPage}
        loading={isLoading}
      />

      {roleChangePending && (
        <ConfirmationModal
          isOpen={!!roleChangePending}
          title="Confirm role change"
          message={
            <>
              Change role for <strong>{roleChangePending.userName}</strong> to{' '}
              <strong>{roleChangePending.newRoleName || '(none)'}</strong>?
            </>
          }
          confirmText="Confirm"
          cancelText="Cancel"
          isLoading={setRolesMutation.isPending}
          onConfirm={async () => {
            if (!roleChangePending) return;
            try {
              await setRolesTrigger({
                userId: roleChangePending.userId,
                roles: roleChangePending.newRoleId
                  ? [Number(roleChangePending.newRoleId)]
                  : [],
              }).unwrap();
              addToast('Role updated', 'success');
              setRoleChangePending(null);
            } catch (err) {
              console.error(err);
              addToast('Failed to update role', 'error');
            }
          }}
          onClose={() => setRoleChangePending(null)}
        />
      )}

      {confirmAction && (
        <ConfirmationModal
          isOpen={!!confirmAction}
          title={`Confirm ${confirmAction.type === 'deactivate' ? 'deactivation' : 'activation'}`}
          message={
            <>
              Are you sure you want to {confirmAction.type}{' '}
              <strong>{confirmAction.userName}</strong>?
            </>
          }
          confirmText="Confirm"
          cancelText="Cancel"
          isDangerous={confirmAction.type === 'deactivate'}
          onConfirm={async () => {
            if (!confirmAction) return;
            try {
              if (confirmAction.type === 'deactivate') {
                await deactivateTrigger(confirmAction.userId).unwrap();
                addToast('User deactivated', 'success');
              } else {
                await activateTrigger(confirmAction.userId).unwrap();
                addToast('User activated', 'success');
              }
              setConfirmAction(null);
            } catch (err) {
              console.error(err);
              addToast('Action failed', 'error');
            }
          }}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </AdminLayout>
  );
}
