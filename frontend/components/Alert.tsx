import React from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  message: React.ReactNode;
  onClose?: () => void;
}

const alertIcons: Record<AlertType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const alertStyles: Record<AlertType, string> = {
  success: 'bg-green-100 border-green-300 text-green-800',
  error: 'bg-red-100 border-red-200 text-red-800',
  warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  info: 'bg-blue-100 border-blue-200 text-blue-800',
};

export default function Alert({ type = 'info', message, onClose }: AlertProps): React.ReactElement {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${alertStyles[type]}`}>
      <span className="text-base font-bold">{alertIcons[type]}</span>
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="bg-transparent border-none text-inherit cursor-pointer text-lg p-0 leading-none transition-opacity hover:opacity-70"
        >
          ×
        </button>
      )}
    </div>
  );
}
