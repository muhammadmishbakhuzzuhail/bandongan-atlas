'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';
import { FormModal } from '@/components/admin/FormModal';
import { MasterDesa, MasterIndikator } from '@/types/database';
import { AdminHeader, AdminFilterContainer, AdminSearchInput, AdminSelect, AdminFormSelect, AdminTableContainer, AdminTableHead, AdminTh, AdminSortIcon, AdminTr, AdminTd, AdminButton, AdminTableSkeleton, AdminEmptyRow } from '@/components/admin/TableLayout';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const PAGE_SIZE = 10;

interface MonografiRow {
  id: string;
  desa_id: string;
  indikator_id: string;
  tahun: number;
  bulan: number;
  nilai: number;
}

interface FormState {
  desa_id: string;
  indikator_id: string;
  tahun: number;
  bulan: number;
  nilai: string;
}

const defaultForm = (): FormState => ({
  desa_id: '',
  indikator_id: '',
  tahun: new Date().getFullYear(),
  bulan: new Date().getMonth() + 1,
  nilai: '',
});

type SortColumn = 'desa' | 'indikator' | 'waktu' | 'nilai';

export default function MonografiPage() {
  const [rows, setRows] = useState<MonografiRow[]>([]);
  const [desas, setDesas] = useState<MasterDesa[]>([]);
  const [indikators, setIndikators] = useState<MasterIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  
  const [sortCol, setSortCol] = useState<SortColumn>('desa');
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, dRes, iRes] = await Promise.all([
        fetch('/api/monografi/all'),
        fetch('/api/desa'),
        fetch('/api/indikator'),
      ]);
      const [mData, dData, iData] = await Promise.all([mRes.json(), dRes.json(), iRes.json()]);
      setRows(mData.data || []);
      setDesas(dData.data || []);
      setIndikators(iData.data || []);
    } catch { /* noop */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const desaMap = useMemo(() => new Map(desas.map(d => [d.id, d.nama_desa])), [desas]);
  const indMap = useMemo(() => new Map(indikators.map(i => [i.id, i.nama_indikator])), [indikators]);

  const filteredAndSorted = useMemo(() => {
    const filtered = rows.filter(r => {
      const desaNama = desaMap.get(r.desa_id) ?? r.desa_id;
      const indNama = indMap.get(r.indikator_id) ?? r.indikator_id;
      const matchSearch = !search || [desaNama, indNama, String(r.nilai)].some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchDesa = !filterDesa || r.desa_id === filterDesa;
      const matchTahun = !filterTahun || String(r.tahun) === filterTahun;
      return matchSearch && matchDesa && matchTahun;
    });

    return filtered.sort((a, b) => {
      // Primary Sort: Always Desa (for grouping) unless explicitly sorting another way
      // Actually, if we want strict grouping, we ALWAYS sort by Desa first.
      const desaA = desaMap.get(a.desa_id) ?? a.desa_id;
      const desaB = desaMap.get(b.desa_id) ?? b.desa_id;
      const desaCmp = desaA.localeCompare(desaB);
      
      if (desaCmp !== 0) {
        return sortCol === 'desa' && !sortAsc ? -desaCmp : desaCmp;
      }

      // Secondary Sort: within the same Desa
      let cmp = 0;
      if (sortCol === 'indikator') {
        const indA = indMap.get(a.indikator_id) ?? a.indikator_id;
        const indB = indMap.get(b.indikator_id) ?? b.indikator_id;
        cmp = indA.localeCompare(indB);
      } else if (sortCol === 'waktu') {
        cmp = (a.tahun * 12 + a.bulan) - (b.tahun * 12 + b.bulan);
      } else if (sortCol === 'nilai') {
        cmp = a.nilai - b.nilai;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, search, filterDesa, filterTahun, desaMap, indMap, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const years = [...new Set(rows.map(r => r.tahun))].sort((a, b) => b - a);

  const openAdd = () => { setEditId(null); setForm(defaultForm()); setModalOpen(true); };
  const openEdit = (row: MonografiRow) => {
    setEditId(row.id);
    setForm({ desa_id: row.desa_id, indikator_id: row.indikator_id, tahun: row.tahun, bulan: row.bulan, nilai: String(row.nilai) });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/monografi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tahun: Number(form.tahun), bulan: Number(form.bulan), nilai: parseFloat(form.nilai) }),
      });
      if (res.ok) { setModalOpen(false); fetchAll(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await fetch(`/api/monografi/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchAll();
  };

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
    setPage(1);
  };

  let currentDesaId: string | null = null;

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Data Monografi" 
        subtitle={`${filteredAndSorted.length} entri ditemukan`} 
        action={<AdminButton onClick={openAdd}>Tambah +</AdminButton>}
      />

      {/* Filters */}
      <AdminFilterContainer>
        <AdminSearchInput 
          value={search} 
          onChange={val => { setSearch(val); setPage(1); }} 
        />
        <AdminSelect value={filterDesa} onChange={val => { setFilterDesa(val); setPage(1); }} className="min-w-[180px]">
          <option value="">Semua Desa</option>
          {desas.map(d => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
        </AdminSelect>
        <AdminSelect value={filterTahun} onChange={val => { setFilterTahun(val); setPage(1); }}>
          <option value="">Semua Tahun</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </AdminSelect>
      </AdminFilterContainer>

      {/* Table */}
      <AdminTableContainer currentPage={page} totalPages={totalPages} onPageChange={setPage}>
        <AdminTableHead>
          <AdminTh className="text-left" onClick={() => handleSort('desa')} sortable>Desa <AdminSortIcon active={sortCol === 'desa'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left" onClick={() => handleSort('indikator')} sortable>Indikator <AdminSortIcon active={sortCol === 'indikator'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-center" onClick={() => handleSort('waktu')} sortable>Waktu <AdminSortIcon active={sortCol === 'waktu'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-right" onClick={() => handleSort('nilai')} sortable>Nilai <AdminSortIcon active={sortCol === 'nilai'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-center">Aksi</AdminTh>
        </AdminTableHead>
        <tbody>
          {loading ? (
            <AdminTableSkeleton rows={PAGE_SIZE} cols={5} />
          ) : paginated.length === 0 ? (
            <AdminEmptyRow colSpan={5}>
              Belum ada data. Klik <strong className="text-[#173B39]">Tambah +</strong> untuk memulai.
            </AdminEmptyRow>
          ) : (
            paginated.map(row => {
              const isNewDesa = row.desa_id !== currentDesaId;
              currentDesaId = row.desa_id;
              
              return (
                <Fragment key={row.id}>
                  {isNewDesa && (
                    <tr className="bg-[#1E716A]/[0.03] border-b border-[#173B39]/5">
                      <td colSpan={5} className="px-5 py-3 text-[0.8rem] font-bold text-[#1E716A] uppercase tracking-wider">
                        {desaMap.get(row.desa_id) ?? row.desa_id}
                      </td>
                    </tr>
                  )}
                  <AdminTr>
                    <AdminTd className="font-medium text-[#173B39] pl-8 text-[0.9rem]">{desaMap.get(row.desa_id) ?? row.desa_id}</AdminTd>
                    <AdminTd className="text-[#173B39]/80 text-[0.9rem]">{indMap.get(row.indikator_id) ?? row.indikator_id}</AdminTd>
                    <AdminTd className="text-center text-[#173B39]/70 text-[0.9rem]">{MONTHS[(row.bulan ?? 1) - 1]} {row.tahun}</AdminTd>
                    <AdminTd className="text-right font-mono text-[0.95rem] font-semibold text-[#173B39]">{row.nilai?.toLocaleString('id-ID')}</AdminTd>
                    <AdminTd>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(row)} className="p-2 rounded-lg text-[#1E716A] hover:bg-[#1E716A]/10 transition-colors" aria-label="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(row.id)} disabled={deleteId === row.id} className="p-2 rounded-lg text-[#a8453f] hover:bg-[#a8453f]/10 transition-colors disabled:opacity-40" aria-label="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </AdminTd>
                  </AdminTr>
                </Fragment>
              );
            })
          )}
        </tbody>
      </AdminTableContainer>

      {/* Modal */}
      <FormModal isOpen={modalOpen} title={editId ? 'Edit Data Monografi' : 'Tambah Data Monografi'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Desa</label>
              <AdminFormSelect required value={form.desa_id} onChange={e => setForm(f => ({ ...f, desa_id: e.target.value }))}>
                <option value="" disabled>-- Pilih Desa --</option>
                {desas.map(d => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </AdminFormSelect>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Indikator</label>
              <AdminFormSelect required value={form.indikator_id} onChange={e => setForm(f => ({ ...f, indikator_id: e.target.value }))}>
                <option value="" disabled>-- Pilih Indikator --</option>
                {indikators.map(i => <option key={i.id} value={i.id}>{i.nama_indikator} ({i.satuan})</option>)}
              </AdminFormSelect>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Bulan</label>
              <AdminFormSelect required value={form.bulan} onChange={e => setForm(f => ({ ...f, bulan: Number(e.target.value) }))}>
                {MONTHS.map((m, idx) => <option key={idx + 1} value={idx + 1}>{m}</option>)}
              </AdminFormSelect>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Tahun</label>
              <input type="number" required min={2000} max={2100} value={form.tahun} onChange={e => setForm(f => ({ ...f, tahun: Number(e.target.value) }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Nilai</label>
              <input type="number" step="any" required value={form.nilai} onChange={e => setForm(f => ({ ...f, nilai: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#173B39]/5">
            <button type="button" onClick={() => setModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-[0.9rem] font-semibold text-[#173B39]/70 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">Batal</button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-5 py-2.5 text-[0.9rem] font-semibold bg-[#1E716A] text-white rounded-xl hover:bg-[#155A55] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
