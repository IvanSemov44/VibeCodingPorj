import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import ToolApprovalCard from '../../components/admin/ToolApprovalCard';
import { SkeletonCard } from '../../components/Loading/SkeletonCard';
import { SkeletonTableRow } from '../../components/Loading/SkeletonTableRow';
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
import type { Tool, Role, ApiListResponse } from '../../lib/types';

export default function AdminToolsPage() {
  const router = useRouter();
  const status = typeof router.query.status === 'string' ? (router.query.status as string) : undefined;
  const pendingMode = status === 'pending';
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.roles?.some((role: string | Role) =>
    typeof role === 'string'
      ? role === 'admin' || role === 'owner'
      : role?.name === 'admin' || role?.name === 'owner'
  );

  // Always call hooks unconditionally
  const pendingResult = useGetPendingToolsQuery();
  const toolsResult = useGetToolsQuery({ per_page: 20, page: Number(router.query.page ?? 1) });

  const { data, isLoading } = pendingMode ? pendingResult : toolsResult;
  const { refetch } = pendingMode ? pendingResult : toolsResult;

  const [approveTrigger] = useApproveToolMutation();
  const [rejectTrigger] = useRejectToolMutation();
  const { addToast } = useToast();
  const qc = useQueryClient();

  const [rejectingTool, setRejectingTool] = useState<Tool | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [approvingTool, setApprovingTool] = useState<Tool | null>(null);

  const payload = data as ApiListResponse<Tool>;
  const tools: Tool[] = Array.isArray(payload?.data)
    ? payload.data
    : [];

  async function performApprove(id: number | string) {
    const key = ['admin', 'pending-tools'];
    const previous = qc.getQueryData<ApiListResponse<Tool>>(key);
    try {
      qc.setQueryData(key, (old: ApiListResponse<Tool> | Tool[] | undefined) => {
        if (!old) return old;
        if (Array.isArray((old as ApiListResponse<Tool>).data)) {
          const response = old as ApiListResponse<Tool>;
          return { ...response, data: response.data.filter((t: Tool) => t.id !== id) };
        }
        if (Array.isArray(old)) return (old as Tool[]).filter((t: Tool) => t.id !== id);
        return old;
      });

      await approveTrigger(id).unwrap();
      await refetch();
      addToast('Tool approved', 'success');
    } catch (error) {
      console.error(error);
      qc.setQueryData(key, previous);
      addToast('Approve failed', 'error');
    }
  }

  function requestApprove(tool: Tool) {
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
    <AdminLayout
      title={pendingMode ? 'Pending Tool Approvals' : 'Tools'}
      description={pendingMode ? 'Review and approve submitted tools' : 'Manage all tools'}
    >
      {isLoading && pendingMode && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {isLoading && !pendingMode && (
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
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && tools.length === 0 && <div>No tools found</div>}

      {!isLoading && pendingMode ? (
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
            onClick={() => router.push({ pathname: router.pathname, query: { ...router.query, page: Math.max(1, (payload?.meta?.current_page ?? 1) - 1) } })}
            disabled={(payload?.meta?.current_page ?? 1) <= 1}
          >
            Previous
          </button>
          <div className="text-[var(--text-primary)]">Page {payload?.meta?.current_page ?? 1} of {payload?.meta?.last_page ?? '-'}</div>
          <button
            className="px-3 py-1 border border-[var(--border-color)] rounded bg-[var(--primary-bg)] text-[var(--text-primary)] disabled:opacity-50"
            onClick={() => router.push({ pathname: router.pathname, query: { ...router.query, page: (payload?.meta?.current_page ?? 0) + 1 } })}
            disabled={(payload?.meta?.current_page ?? 0) >= (payload?.meta?.last_page ?? 1)}
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
    </AdminLayout>
  );
}
