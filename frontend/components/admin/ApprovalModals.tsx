import React from 'react';
import { Modal } from '../ui';
import type { Tool } from '../../lib/types';

interface ApprovalModalsProps {
  rejectingTool: Tool | null;
  approvingTool: Tool | null;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  onCloseRejectModal: () => void;
  onCloseApproveModal: () => void;
  onConfirmReject: () => Promise<void>;
  onConfirmApprove: () => Promise<void>;
}

export const ApprovalModals: React.FC<ApprovalModalsProps> = ({
  rejectingTool,
  approvingTool,
  rejectReason,
  onRejectReasonChange,
  onCloseRejectModal,
  onCloseApproveModal,
  onConfirmReject,
  onConfirmApprove,
}) => {
  return (
    <>
      {rejectingTool && (
        <Modal title={`Reject ${rejectingTool.name}`} onClose={onCloseRejectModal}>
          <div>
            <label className="block text-sm font-medium mb-2">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => onRejectReasonChange(e.target.value)}
              className="w-full border border-[var(--border-color)] rounded p-2 h-24 bg-[var(--primary-bg)] text-[var(--text-primary)]"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="px-3 py-2 bg-[var(--secondary-bg)] rounded text-[var(--text-primary)]"
                onClick={onCloseRejectModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-[var(--danger)] text-white rounded hover:bg-[var(--danger-hover)]"
                onClick={onConfirmReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </Modal>
      )}
      {approvingTool && (
        <Modal title={`Approve ${approvingTool.name}?`} onClose={onCloseApproveModal}>
          <div>
            <p className="text-[var(--text-primary)]">Are you sure you want to approve this tool?</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="px-3 py-2 bg-[var(--secondary-bg)] rounded text-[var(--text-primary)]"
                onClick={onCloseApproveModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)]"
                onClick={onConfirmApprove}
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
