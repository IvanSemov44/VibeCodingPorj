import React from 'react';

export default function Modal({
  title,
  children,
  onClose,
}: {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay-bg)]">
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] rounded-lg shadow-lg max-w-lg w-full p-6 border border-[var(--border-color)]">
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div>{children}</div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded bg-[var(--secondary-bg)] hover:bg-[var(--secondary-bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
