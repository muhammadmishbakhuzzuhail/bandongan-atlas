import React from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';

export function AdminHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#173B39] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-[#173B39]/60 mt-0.5 sm:mt-1">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}

export function AdminFilterContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#173B39]/10 p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-4 shadow-sm">
      {children}
    </div>
  );
}

export function AdminSearchInput({ value, onChange, placeholder = "Cari data..." }: { value: string, onChange: (val: string) => void, placeholder?: string }) {
  return (
    <div className="relative flex-1 min-w-0 w-full sm:min-w-[200px]">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#173B39]/40 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2.5 w-full bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] text-[#173B39] placeholder:text-[#173B39]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] transition-colors"
      />
    </div>
  );
}

export function AdminSelect({ value, onChange, children, className = "" }: { value: string | number, onChange: (val: string) => void, children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: 'none' }}
        className="w-full appearance-none px-4 py-2.5 pr-10 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] text-[#173B39] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] transition-colors cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#173B39]/50 pointer-events-none" />
    </div>
  );
}

export function AdminFormSelect({ value, onChange, children, required = false, className = "" }: { value: string | number, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, required?: boolean, className?: string }) {
  return (
    <div className={`relative w-full ${className}`}>
      <select
        required={required}
        value={value}
        onChange={onChange}
        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: 'none' }}
        className="w-full appearance-none px-4 py-3 pr-10 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#173B39]/50 pointer-events-none" />
    </div>
  );
}

export function AdminTableContainer({ children, currentPage, totalPages, onPageChange }: { children: React.ReactNode, currentPage?: number, totalPages?: number, onPageChange?: (page: number) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-[#173B39]/10 overflow-hidden shadow-sm">
      <div className="overflow-x-auto overscroll-x-contain -webkit-overflow-scrolling-touch">
        <table className="w-full text-sm min-w-[600px] sm:min-w-full">
          {children}
        </table>
      </div>
      {currentPage !== undefined && totalPages !== undefined && onPageChange && (
        <div className="border-t border-[#173B39]/10">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[#173B39]/10">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTh({ children, onClick, sortable, className = "" }: { children: React.ReactNode, onClick?: () => void, sortable?: boolean, className?: string }) {
  return (
    <th
      className={`px-4 sm:px-5 py-3.5 sm:py-4 text-xs font-bold text-[#173B39]/70 uppercase tracking-wider select-none ${sortable ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

export function AdminSortIcon({ active, asc }: { active: boolean, asc: boolean }) {
  if (!active) return <ChevronUp size={14} className="opacity-20 inline-block ml-1" />;
  return asc ? <ChevronUp size={14} className="inline-block ml-1 text-[#1E716A]" /> : <ChevronDown size={14} className="inline-block ml-1 text-[#1E716A]" />;
}

export function AdminTr({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`border-b border-[#173B39]/5 hover:bg-[#F9FAFB] transition-colors last:border-0 ${className}`}>
      {children}
    </tr>
  );
}

export function AdminTd({ children, className = "", colSpan, title, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td colSpan={colSpan} title={title} className={`px-4 sm:px-5 py-3 sm:py-3.5 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function AdminTableSkeleton({ rows = 10, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <AdminTr key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <AdminTd key={j}>
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
            </AdminTd>
          ))}
        </AdminTr>
      ))}
    </>
  );
}

export function AdminEmptyRow({ colSpan, children }: { colSpan: number, children: React.ReactNode }) {
  return (
    <AdminTr>
      <AdminTd colSpan={colSpan} className="px-4 sm:px-5 py-12 sm:py-16 text-center text-[#173B39]/50 text-sm sm:text-[0.95rem]">
        {children}
      </AdminTd>
    </AdminTr>
  );
}

export function AdminButton({ children, onClick, variant = 'primary', disabled = false, type = 'button', className = "" }: { children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'danger' | 'ghost', disabled?: boolean, type?: 'button' | 'submit', className?: string }) {
  const base = "w-full sm:w-auto px-5 py-2.5 rounded-xl text-[0.9rem] font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]";
  const variants = {
    primary: "bg-[#1E716A] text-white hover:bg-[#155A55] hover:shadow-md focus:ring-[#1E716A]",
    secondary: "bg-[#F9FAFB] text-[#173B39]/80 border border-[#173B39]/10 hover:bg-gray-100 focus:ring-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-[#173B39]/70 hover:bg-gray-100 shadow-none border border-transparent"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
