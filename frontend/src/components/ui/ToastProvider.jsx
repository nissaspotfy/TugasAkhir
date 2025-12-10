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
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 animate-in slide-in-from-right fade-in
              ${toast.type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-800' : ''}
              ${toast.type === 'error' ? 'bg-white border-l-4 border-red-500 text-gray-800' : ''}
              ${toast.type === 'info' ? 'bg-white border-l-4 border-blue-500 text-gray-800' : ''}
            `}
            style={{ minWidth: '300px' }}
          >
            <div className="flex-shrink-0">
               {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
               {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
               {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="flex-1 font-medium text-sm">{toast.message}</p>
            <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
