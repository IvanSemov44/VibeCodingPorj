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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div>{children}</div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded bg-secondary-bg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
