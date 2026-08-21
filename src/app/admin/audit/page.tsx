'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';

const PAGE_SIZE = 15;

interface AuditLog {
  id: string;
  user_id: string;
  aksi: string;
  tabel_terdampak: string;
  keterangan: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-50 text-blue-700',
  CREATE: 'bg-green-50 text-green-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  UPSERT: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-red-50 text-red-700',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const json = await res.json();
      setLogs(json.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() =>
    logs.filter(l => !search || [l.aksi, l.tabel_terdampak, l.keterangan, l.user_id].some(s => (s || '').toLowerCase().includes(search.toLowerCase()))),
    [logs, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#173B39] flex items-center gap-2">
            <ClipboardList size={20} className="text-[#1E716A]" />
            Log Aktivitas
          </h1>
          <p className="text-sm text-[#173B39]/60 mt-0.5">{logs.length} aktivitas tercatat (terbaru di atas)</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 border border-[#173B39]/20 text-[#173B39]/70 rounded-lg text-sm font-medium hover:bg-[#EEF3F0] transition-colors">
          Muat ulang
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#173B39]/10 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#173B39]/40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari aksi, tabel, keterangan…" className="pl-9 pr-3 py-2 w-full border border-[#173B39]/15 rounded-lg text-sm text-[#173B39] placeholder:text-[#173B39]/40 focus:outline-none focus:ring-1 focus:ring-[#1E716A]" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#173B39]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF3F0] text-[#173B39]/70 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Waktu</th>
                <th className="px-4 py-3 text-left">Aksi</th>
                <th className="px-4 py-3 text-left">Tabel</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#173B39]/5">
                    {Array.from({ length: 4 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#D9E8E5] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-[#173B39]/50 text-sm"><ClipboardList size={32} className="mx-auto mb-2 opacity-30" />Belum ada log aktivitas.</td></tr>
              ) : paginated.map(log => (
                <tr key={log.id} className="border-t border-[#173B39]/5 hover:bg-[#EEF3F0]/50 transition-colors">
                  <td className="px-4 py-3 text-[#173B39]/60 text-xs whitespace-nowrap font-mono">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.aksi] ?? 'bg-gray-100 text-gray-700'}`}>{log.aksi}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#173B39]/60">{log.tabel_terdampak}</td>
                  <td className="px-4 py-3 text-[#173B39]/80 text-xs max-w-xs truncate" title={log.keterangan}>{log.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
