import React, { createContext, useContext, useState } from 'react';
import styles from './Toast.module.css';
import { cx } from '../lib/classNames';

type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' };

type ToastContextType = { addToast: (message: string, type?: ToastItem['type'], duration?: number) => void; removeToast: (id: number) => void };

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem['type'] = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastContainer({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: number) => void }): React.ReactElement | null {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map(toast => {
        const toastClassName = cx(
          styles.toast,
          styles[`toast_${toast.type}`]
        );

        return (
          <div key={toast.id} className={toastClassName}>
            <span className={styles.icon}>{toastIcons[toast.type]}</span>
            <span className={styles.message}>{toast.message}</span>
            <button onClick={() => onClose(toast.id)} className={styles.closeButton}>×</button>
          </div>
        );
      })}
    </div>
  );
}
