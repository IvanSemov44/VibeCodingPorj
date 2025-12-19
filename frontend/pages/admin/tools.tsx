import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../../components/layouts';
import ToolApprovalCard from '../../components/admin/ToolApprovalCard';
import { ApprovalModals } from '../../components/admin/ApprovalModals';
import { ToolsTable } from '../../components/admin/ToolsTable';
import Pagination from '../../components/admin/Pagination';
import { SkeletonCard } from '../../components/Loading/SkeletonCard';
import { SkeletonTableRow } from '../../components/Loading/SkeletonTableRow';
import { useToast } from '../../components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetPendingToolsQuery,
  useApproveToolMutation,
  useRejectToolMutation,
  useGetToolsQuery,
} from '../../store/domains';
import { useAuth } from '../../hooks/useAuth';
import type { Tool, ApiListResponse } from '../../lib/types';

export default function AdminToolsPage() {
  const router = useRouter();
  const status =
    typeof router.query.status === 'string' ? (router.query.status as string) : undefined;
  const pendingMode = status === 'pending';
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // Check if user is admin
  const isAdmin = user?.roles?.some((role) =>
    typeof role === 'string'
      ? role === 'admin' || role === 'owner'
      : typeof role === 'object' && role !== null && 'name' in role ? (role.name === 'admin' || role.name === 'owner') : false,
  );

  // Always call hooks unconditionally
  const pendingResult = useGetPendingToolsQuery();
  const toolsResult = useGetToolsQuery({ per_page: 20, page });

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
  const pagination = {
    current_page: payload?.meta?.current_page || payload?.current_page || 1,
    last_page: payload?.meta?.last_page || payload?.last_page || 1,
    total: payload?.meta?.total || payload?.total || 0,
  };
  const tools: Tool[] = Array.isArray(payload?.data) ? payload.data : [];

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

  async function handleConfirmReject() {
    if (rejectingTool) {
      await handleReject(rejectingTool.id, rejectReason || undefined);
      setRejectingTool(null);
      setRejectReason('');
    }
  }

  async function handleConfirmApprove() {
    if (approvingTool) {
      await performApprove(approvingTool.id);
      setApprovingTool(null);
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

      {!isLoading && tools.length === 0 && (
        <div className="text-[var(--text-primary)]">No tools found</div>
      )}

      {!isLoading && pendingMode ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {tools.map((t: Tool) => (
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
        <>
          <ToolsTable
            tools={tools}
            isAdmin={isAdmin}
            onRequestApprove={requestApprove}
            onRequestReject={(tool) => setRejectingTool(tool)}
          />

          {/* Pagination for full tools list */}
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={20}
            onPageChange={setPage}
            loading={isLoading}
          />
        </>
      )}

      <ApprovalModals
        rejectingTool={rejectingTool}
        approvingTool={approvingTool}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onCloseRejectModal={() => {
          setRejectingTool(null);
          setRejectReason('');
        }}
        onCloseApproveModal={() => setApprovingTool(null)}
        onConfirmReject={handleConfirmReject}
        onConfirmApprove={handleConfirmApprove}
      />
    </AdminLayout>
  );
}
