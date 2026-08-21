'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function FormModal({ isOpen, title, onClose, children }: FormModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#173B39]/10 shrink-0 bg-white sticky top-0 z-10">
          <h2 className="text-base sm:text-lg font-bold text-[#173B39] tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#173B39]/50 hover:text-[#173B39] hover:bg-gray-100 active:bg-gray-200 transition-colors p-2 rounded-xl"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
