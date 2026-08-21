'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';
import { AdminHeader, AdminFilterContainer, AdminSearchInput, AdminTableContainer, AdminTableHead, AdminTh, AdminSortIcon, AdminTr, AdminTd, AdminButton, AdminTableSkeleton, AdminEmptyRow } from '@/components/admin/TableLayout';

const PAGE_SIZE = 10;

interface AuditLog {
  id: string;
  user_id: string;
  aksi: string;
  tabel_terdampak: string;
  keterangan: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-50 text-blue-700 border border-blue-200',
  CREATE: 'bg-green-50 text-green-700 border border-green-200',
  UPDATE: 'bg-amber-50 text-amber-700 border border-amber-200',
  UPSERT: 'bg-amber-50 text-amber-700 border border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border border-red-200',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type SortColumn = 'waktu' | 'aksi' | 'tabel';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [sortCol, setSortCol] = useState<SortColumn>('waktu');
  const [sortAsc, setSortAsc] = useState(false); // default descending for waktu

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const json = await res.json();
      setLogs(json.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredAndSorted = useMemo(() => {
    const filtered = logs.filter(l => !search || [l.aksi, l.tabel_terdampak, l.keterangan, l.user_id].some(s => (s || '').toLowerCase().includes(search.toLowerCase())));
    
    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'waktu') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortCol === 'aksi') {
        cmp = (a.aksi || '').localeCompare(b.aksi || '');
      } else if (sortCol === 'tabel') {
        cmp = (a.tabel_terdampak || '').localeCompare(b.tabel_terdampak || '');
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [logs, search, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Log Aktivitas" 
        subtitle={`${filteredAndSorted.length} aktivitas tercatat`} 
        action={<AdminButton variant="secondary" onClick={fetchAll}>Muat Ulang</AdminButton>}
      />

      <AdminFilterContainer>
        <AdminSearchInput 
          value={search} 
          onChange={val => { setSearch(val); setPage(1); }} 
          placeholder="Cari aksi, tabel, keterangan..." 
        />
      </AdminFilterContainer>

      <AdminTableContainer currentPage={page} totalPages={totalPages} onPageChange={setPage}>
        <AdminTableHead>
          <AdminTh className="text-left" onClick={() => handleSort('waktu')} sortable>Waktu <AdminSortIcon active={sortCol === 'waktu'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left" onClick={() => handleSort('aksi')} sortable>Aksi <AdminSortIcon active={sortCol === 'aksi'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left" onClick={() => handleSort('tabel')} sortable>Tabel <AdminSortIcon active={sortCol === 'tabel'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left">Keterangan</AdminTh>
        </AdminTableHead>
        <tbody>
          {loading ? (
            <AdminTableSkeleton rows={PAGE_SIZE} cols={4} />
          ) : paginated.length === 0 ? (
            <AdminEmptyRow colSpan={4}>
              Belum ada log aktivitas.
            </AdminEmptyRow>
          ) : (
            paginated.map(log => (
              <AdminTr key={log.id}>
                <AdminTd className="text-[#173B39]/60 text-[0.85rem] whitespace-nowrap font-mono">{formatDate(log.created_at)}</AdminTd>
                <AdminTd>
                  <span className={`inline-flex px-2 py-1 rounded text-[0.7rem] font-bold uppercase tracking-wider ${ACTION_COLORS[log.aksi] ?? 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                    {log.aksi}
                  </span>
                </AdminTd>
                <AdminTd className="text-[0.85rem] font-mono text-[#173B39]/60">{log.tabel_terdampak}</AdminTd>
                <AdminTd className="text-[#173B39]/80 text-[0.9rem] max-w-xs truncate" title={log.keterangan}>{log.keterangan}</AdminTd>
              </AdminTr>
            ))
          )}
        </tbody>
      </AdminTableContainer>
    </div>
  );
}
