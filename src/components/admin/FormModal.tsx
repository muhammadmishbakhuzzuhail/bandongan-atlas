'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function FormModal({ isOpen, title, onClose, children }: FormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      style={{ border: 'none' }}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#173B39]/10">
        <h2 className="text-base font-semibold text-[#173B39]">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[#173B39]/50 hover:text-[#173B39] transition-colors p-1 rounded"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </dialog>
  );
}
