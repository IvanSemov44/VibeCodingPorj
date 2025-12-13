import React, { createContext, useContext, useState } from 'react';

type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' };

type ToastContextType = { addToast: (message: string, type?: ToastItem['type'], duration?: number) => void; removeToast: (id: number) => void };

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

const toastStyles: Record<ToastItem['type'], string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white'
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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-[slideIn_0.3s_ease-out] pointer-events-auto ${toastStyles[toast.type]}`}
        >
          <span className="text-lg font-bold">{toastIcons[toast.type]}</span>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => onClose(toast.id)} className="bg-transparent border-none text-white cursor-pointer text-xl leading-none transition-opacity hover:opacity-70">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
