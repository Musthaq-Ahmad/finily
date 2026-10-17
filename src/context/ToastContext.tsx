import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ToastItem {
  id: string;
  message: string;
  tone: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastItem['tone'] = 'default') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
