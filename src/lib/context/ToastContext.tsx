'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-500 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
    },
    error: {
      bg: 'bg-red-50 border-red-500 text-red-800',
      icon: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-500 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />
    }
  };

  const current = config[toast.type];

  return (
    <div className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border-l-4 shadow-lg animate-in slide-in-from-bottom-4 duration-300 ${current.bg}`}>
      <div className="flex items-center gap-3">
        {current.icon}
        <span className="text-sm font-semibold">{toast.message}</span>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors ml-4"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
