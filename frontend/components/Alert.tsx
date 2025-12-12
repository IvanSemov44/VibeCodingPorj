import React from 'react';
import styles from './Alert.module.css';
import { cx } from '../lib/classNames';

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
  info: 'ℹ'
};

export default function Alert({ type = 'info', message, onClose }: AlertProps): React.ReactElement {
  const className = cx(
    styles.alert,
    styles[`alert_${type}`]
  );

  return (
    <div className={className}>
      <span className={styles.icon}>{alertIcons[type]}</span>
      <div className={styles.message}>{message}</div>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton}>×</button>
      )}
    </div>
  );
}
