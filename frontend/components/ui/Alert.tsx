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
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export default function Alert({ type = 'info', message, onClose }: AlertProps): React.ReactElement {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg text-sm ${alertStyles[type]}`}>
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
