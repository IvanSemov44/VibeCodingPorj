import React from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  message: React.ReactNode;
  onClose?: () => void;
}

export default function Alert({ type = 'info', message, onClose }: AlertProps): React.ReactElement {
  const types: Record<AlertType, { bg: string; border: string; color: string; icon: string }> = {
    success: { bg: '#d1fae5', border: '#86efac', color: '#065f46', icon: '✓' },
    error: { bg: '#fee2e2', border: '#fecaca', color: '#991b1b', icon: '✕' },
    warning: { bg: '#fef3c7', border: '#fde68a', color: '#92400e', icon: '⚠' },
    info: { bg: '#dbeafe', border: '#bfdbfe', color: '#1e40af', icon: 'ℹ' }
  };

  const style = types[type] || types.info;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'start',
      gap: 12,
      padding: 12,
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 8,
      color: style.color,
      fontSize: 14
    }}>
      <span style={{ fontSize: 16, fontWeight: 'bold' }}>{style.icon}</span>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: style.color, cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}
