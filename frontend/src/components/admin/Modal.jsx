import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };
  const sizeClass = sizeClasses[size] || 'max-w-md';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      {/* Background click handler */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Container */}
      <div className={`bg-white rounded-[24px] w-full ${sizeClass} shadow-2xl relative flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden z-10 transition-all transform duration-300`}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border/40 flex-shrink-0">
          <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-secondary/60 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 scroll-smooth no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
