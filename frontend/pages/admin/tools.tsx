import React from 'react';
import Layout from '../../components/Layout';
import ToolApprovalCard from '../../components/admin/ToolApprovalCard';
import { useGetPendingToolsQuery, useApproveToolMutation, useRejectToolMutation } from '../../store/domains';

export default function AdminToolsPage() {
  const { data, isLoading, refetch } = useGetPendingToolsQuery();
  const [approveTrigger] = useApproveToolMutation();
  const [rejectTrigger] = useRejectToolMutation();

  const payload: any = data;
  const tools = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : payload?.data ?? []);

  async function handleApprove(id: number | string) {
    try {
      await approveTrigger(id).unwrap();
      await refetch();
      alert('Approved');
    } catch (e) {
      console.error(e);
      alert('Approve failed');
    }
  }

  async function handleReject(id: number | string, reason?: string) {
    try {
      await rejectTrigger({ id, reason }).unwrap();
      await refetch();
      alert('Rejected');
    } catch (e) {
      console.error(e);
      alert('Reject failed');
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Pending Tool Approvals</h1>

      {isLoading && <div>Loading pending tools…</div>}

      {!isLoading && tools.length === 0 && <div>No pending tools</div>}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {tools.map((t: any) => (
          <ToolApprovalCard key={t.id} tool={t} onApprove={handleApprove} onReject={handleReject} />
        ))}
      </div>
    </Layout>
  );
}
