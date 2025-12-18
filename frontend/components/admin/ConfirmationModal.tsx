import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  isDangerous = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err) {
      console.error('Confirmation action failed:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--secondary-bg)] p-6 rounded-lg border border-[var(--border-color)] w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{title}</h2>
        <p className="text-[var(--text-secondary)] mb-6">{message}</p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white transition-opacity disabled:opacity-50 font-medium ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[var(--accent)] hover:opacity-90'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
