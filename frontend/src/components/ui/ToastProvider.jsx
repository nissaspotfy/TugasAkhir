import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto relative overflow-hidden flex items-center gap-3.5 px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-right-10 fade-in
              ${toast.type === 'success' ? 'bg-gradient-to-r from-[#bf3843] to-[#e11d48] text-white border border-rose-400/20 shadow-[0_10px_35px_rgba(191,56,67,0.15)]' : ''}
              ${toast.type === 'error' ? 'bg-gradient-to-r from-[#7f1d1d] to-[#991b1b] text-white border border-red-500/20 shadow-[0_10px_35px_rgba(127,29,29,0.15)]' : ''}
              ${toast.type === 'info' ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white border border-amber-400/20 shadow-[0_10px_35px_rgba(245,158,11,0.15)]' : ''}
            `}
            style={{ minWidth: '320px' }}
          >
            <div className="flex-shrink-0 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
               {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-yellow-300" />}
               {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-200" />}
               {toast.type === 'info' && <Info className="w-5 h-5 text-white" />}
            </div>
            <p className="flex-1 font-bold text-xs sm:text-sm tracking-wide leading-relaxed">{toast.message}</p>
            <button 
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            >
                <X className="w-4 h-4" />
            </button>
            {/* Progress Bar */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white/40"
              style={{ animation: 'shrink 3s linear forwards' }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
