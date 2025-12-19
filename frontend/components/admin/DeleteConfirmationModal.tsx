import React from 'react';
import { ConfirmationModal } from './ConfirmationModal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType?: string; // e.g., "tool", "category", "tag", "user"
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

/**
 * Preset modal for delete confirmation with consistent UX
 * Uses isDangerous=true and red styling by default
 */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  itemName,
  itemType = 'item',
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${itemType}?`}
      message={
        <div>
          <p className="text-[var(--text-primary)] mb-2">
            Are you sure you want to delete <strong>{itemName}</strong>?
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            This action cannot be undone.
          </p>
        </div>
      }
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
      isDangerous={true}
    />
  );
}
