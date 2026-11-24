'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: 'border-border bg-card text-foreground',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  error: 'border-rose-300 bg-rose-50 text-rose-950',
  warning: 'border-amber-300 bg-amber-50 text-amber-950',
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />;
    default:
      return <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', durationMs = 4000 }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => {
        dismiss(id);
      }, durationMs);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-20 right-4 left-4 z-[60] flex flex-col gap-2 sm:left-auto sm:bottom-5 sm:w-96"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-sm animate-in fade-in slide-in-from-bottom-2',
              VARIANT_STYLES[item.variant],
            )}
          >
            <ToastIcon variant={item.variant} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-snug">{item.title}</div>
              {item.description && (
                <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100 hover:bg-black/5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
