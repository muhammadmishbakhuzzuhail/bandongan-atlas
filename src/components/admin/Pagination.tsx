'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-[#173B39]/10">
      <p className="text-xs text-[#173B39]/60 text-center sm:text-left">
        Halaman <span className="font-semibold text-[#173B39]">{currentPage}</span> dari <span className="font-semibold text-[#173B39]">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 sm:p-1.5 rounded-lg text-[#173B39]/60 hover:bg-[#EEF3F0] active:bg-[#D9E8E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 sm:px-2 text-xs text-[#173B39]/40 select-none">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[32px] sm:min-w-[28px] h-8 sm:h-7 px-2 rounded-lg text-xs font-semibold transition-all ${
                page === currentPage
                  ? 'bg-[#1E716A] text-white shadow-sm'
                  : 'text-[#173B39]/70 hover:bg-[#EEF3F0] active:bg-[#D9E8E5]'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 sm:p-1.5 rounded-lg text-[#173B39]/60 hover:bg-[#EEF3F0] active:bg-[#D9E8E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
