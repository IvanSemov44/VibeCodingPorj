import React from 'react';
import { ConfirmationModal } from './ConfirmationModal';
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
      <ConfirmationModal
        isOpen={!!rejectingTool}
        onClose={onCloseRejectModal}
        title={`Reject ${rejectingTool?.name}`}
        message={
          <div>
            <label className="block text-sm font-medium mb-2">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => onRejectReasonChange(e.target.value)}
              className="w-full border border-[var(--border-color)] rounded p-2 h-24 bg-[var(--primary-bg)] text-[var(--text-primary)]"
              placeholder="Enter rejection reason..."
            />
          </div>
        }
        confirmText="Confirm Reject"
        cancelText="Cancel"
        onConfirm={onConfirmReject}
        isDangerous={true}
      />

      <ConfirmationModal
        isOpen={!!approvingTool}
        onClose={onCloseApproveModal}
        title={`Approve ${approvingTool?.name}?`}
        message="Are you sure you want to approve this tool?"
        confirmText="Confirm Approve"
        cancelText="Cancel"
        onConfirm={onConfirmApprove}
        isDangerous={false}
      />
    </>
  );
};
