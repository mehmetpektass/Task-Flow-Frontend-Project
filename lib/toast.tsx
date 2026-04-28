'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Modern SVG İkonlar
  const icons = {
    success: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // İkonların arka plan ve yazı renkleri
  const iconStyles = {
    success: 'bg-emerald-100 text-emerald-600',
    error: 'bg-red-100 text-red-600',
    info: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* pointer-events-none: Bildirimlerin altındaki sayfa elemanlarına tıklanabilmesini sağlar */}
      <div className="fixed top-5 right-5 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-3.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 min-w-[280px] max-w-sm toast-enter"
          >
            {/* Renkli İkon Kutusu */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconStyles[toast.type]}`}>
              {icons[toast.type]}
            </div>
            
            {/* Mesaj */}
            <p className="text-[14px] font-semibold text-slate-700 leading-snug">
              {toast.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);