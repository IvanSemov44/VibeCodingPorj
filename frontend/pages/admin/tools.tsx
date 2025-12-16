import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ToolApprovalCard from '../../components/admin/ToolApprovalCard';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetPendingToolsQuery,
  useApproveToolMutation,
  useRejectToolMutation,
  useGetToolsQuery,
} from '../../store/domains';
import { useAuth } from '../../hooks/useAuth';
// AdminGuard removed: rely on Next middleware for server-side protection

export default function AdminToolsPage() {
  const router = useRouter();
  const status = typeof router.query.status === 'string' ? (router.query.status as string) : undefined;
  const pendingMode = status === 'pending';

  const { data, isLoading, refetch } = pendingMode
    ? useGetPendingToolsQuery()
    : useGetToolsQuery({ per_page: 20, page: Number(router.query.page ?? 1) });
  const [approveTrigger] = useApproveToolMutation();
  const [rejectTrigger] = useRejectToolMutation();
  const { addToast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuth(false);
  const isAdmin = Boolean(user && Array.isArray(user.roles) && (user.roles.includes('owner') || user.roles.includes('admin')));

  const [rejectingTool, setRejectingTool] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [approvingTool, setApprovingTool] = useState<any | null>(null);

  const payload: any = data;
  const tools = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : payload?.data ?? []);

  async function performApprove(id: number | string) {
    const key = ['admin', 'pending-tools'];
    const previous = qc.getQueryData<any>(key);
    try {
      qc.setQueryData(key, (old: any) => {
        if (!old) return old;
        if (Array.isArray(old.data)) {
          return { ...old, data: old.data.filter((t: any) => t.id !== id) };
        }
        if (Array.isArray(old)) return old.filter((t: any) => t.id !== id);
        return old;
      });

      await approveTrigger(id).unwrap();
      await refetch();
      addToast('Tool approved', 'success');
    } catch (e) {
      console.error(e);
      qc.setQueryData(key, previous);
      addToast('Approve failed', 'error');
    }
  }

  function requestApprove(tool: any) {
    setApprovingTool(tool);
  }

  async function handleReject(id: number | string, reason?: string) {
    try {
      await rejectTrigger({ id, reason }).unwrap();
      await refetch();
      addToast('Tool rejected', 'success');
    } catch (e) {
      console.error(e);
      addToast('Reject failed', 'error');
    }
  }

  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">{pendingMode ? 'Pending Tool Approvals' : 'Tools'}</h1>

      {isLoading && <div>Loading…</div>}

      {!isLoading && tools.length === 0 && <div>No tools found</div>}

      {pendingMode ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {tools.map((t: any) => (
            <ToolApprovalCard
              key={t.id}
              tool={t}
              onApprove={performApprove}
              onRequestReject={(tool) => setRejectingTool(tool)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
            <thead>
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Owner</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t: any) => (
                <tr key={t.id} className="border-t">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.user?.name ?? t.author_name}</td>
                  <td className="p-2">{t.status ?? (t.is_approved ? 'Approved' : 'Unknown')}</td>
                  <td className="p-2">
                      <a href={`/tools/${t.slug ?? t.id}`} className="text-[var(--accent)] mr-2">
                      View
                    </a>
                    {t.status === 'pending' || t.is_pending ? (
                        isAdmin ? (
                          <>
                            <button
                              className="ml-2 px-2 py-1 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)]"
                              onClick={() => requestApprove(t)}
                            >
                              Approve
                            </button>
                            <button
                              className="ml-2 px-2 py-1 bg-[var(--danger)] text-white rounded hover:bg-[var(--danger-hover)]"
                              onClick={() => setRejectingTool(t)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="ml-2 text-sm text-tertiary-text">Pending</span>
                        )
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination for full tools list */}
      {!pendingMode && (
        <div className="mt-4 flex items-center gap-2">
          <button
            className="px-3 py-1 border border-[var(--border-color)] rounded bg-[var(--primary-bg)] text-[var(--text-primary)] disabled:opacity-50"
            onClick={() => router.push({ pathname: router.pathname, query: { ...router.query, page: Math.max(1, Number(payload?.meta?.current_page || 1) - 1) } })}
            disabled={(payload?.meta?.current_page || 1) <= 1}
          >
            Previous
          </button>
          <div className="text-[var(--text-primary)]">Page {payload?.meta?.current_page || 1} of {payload?.meta?.last_page || '-'}</div>
          <button
            className="px-3 py-1 border border-[var(--border-color)] rounded bg-[var(--primary-bg)] text-[var(--text-primary)] disabled:opacity-50"
            onClick={() => router.push({ pathname: router.pathname, query: { ...router.query, page: Number(payload?.meta?.current_page || 1) + 1 } })}
            disabled={payload?.meta?.current_page >= payload?.meta?.last_page}
          >
            Next
          </button>
        </div>
      )}

      {rejectingTool && (
        <Modal title={`Reject ${rejectingTool.name}`} onClose={() => setRejectingTool(null)}>
          <div>
            <label className="block text-sm font-medium mb-2">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-[var(--border-color)] rounded p-2 h-24 bg-[var(--primary-bg)] text-[var(--text-primary)]"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button className="px-3 py-2 bg-[var(--secondary-bg)] rounded text-[var(--text-primary)]" onClick={() => setRejectingTool(null)}>
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-[var(--danger)] text-white rounded"
                onClick={async () => {
                  await handleReject(rejectingTool.id, rejectReason || undefined);
                  setRejectingTool(null);
                  setRejectReason('');
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </Modal>
      )}
      {approvingTool && (
        <Modal title={`Approve ${approvingTool.name}?`} onClose={() => setApprovingTool(null)}>
          <div>
            <p>Are you sure you want to approve this tool?</p>
            <div className="mt-3 flex justify-end gap-2">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setApprovingTool(null)}>
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-green-500 text-white rounded"
                onClick={async () => {
                  await performApprove(approvingTool.id);
                  setApprovingTool(null);
                }}
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
