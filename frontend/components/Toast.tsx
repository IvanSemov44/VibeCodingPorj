import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addToast as addToastAction, removeToast as removeToastAction } from '../store/toastSlice';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
};

export function useToast() {
  const dispatch = useDispatch();
  const addToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    // dispatch action (slice's prepare sets id)
    const action = addToastAction(message, type, duration) as ReturnType<typeof addToastAction>;
    // cast to a minimal action shape so Dispatch typing is satisfied without using `any`
    const dispatched = action as unknown as { type: string; payload?: ToastItem };
    dispatch(dispatched as unknown as ReturnType<typeof addToastAction>);
    // schedule removal
    if (duration > 0) {
      const id = dispatched.payload?.id as number;
      setTimeout(() => dispatch(removeToastAction(id)), duration);
    }
  };
  return { addToast, removeToast: (id: number) => dispatch(removeToastAction(id)) };
}

export function ToastContainer(): React.ReactElement | null {
  const toasts = useSelector((s: RootState) => s.toast?.toasts ?? []);
  const dispatch = useDispatch();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-[slideIn_0.3s_ease-out] pointer-events-auto ${
            toastStyles[toast.type]
          }`}
        >
          <span className="text-lg font-bold">{toastIcons[toast.type]}</span>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => dispatch(removeToastAction(toast.id))}
            className="bg-transparent border-none text-white cursor-pointer text-xl leading-none transition-opacity hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
