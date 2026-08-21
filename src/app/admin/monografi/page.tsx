'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, BarChart3, Search } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';
import { FormModal } from '@/components/admin/FormModal';
import { MasterDesa, MasterIndikator } from '@/types/database';

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

export default function MonografiPage() {
  const [rows, setRows] = useState<MonografiRow[]>([]);
  const [desas, setDesas] = useState<MasterDesa[]>([]);
  const [indikators, setIndikators] = useState<MasterIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
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

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const desaNama = desaMap.get(r.desa_id) ?? r.desa_id;
      const indNama = indMap.get(r.indikator_id) ?? r.indikator_id;
      const matchSearch = !search || [desaNama, indNama, String(r.nilai)].some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchDesa = !filterDesa || r.desa_id === filterDesa;
      const matchTahun = !filterTahun || String(r.tahun) === filterTahun;
      return matchSearch && matchDesa && matchTahun;
    });
  }, [rows, search, filterDesa, filterTahun, desaMap, indMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#173B39] flex items-center gap-2">
            <BarChart3 size={20} className="text-[#1E716A]" />
            Data Monografi
          </h1>
          <p className="text-sm text-[#173B39]/60 mt-0.5">{filtered.length} entri ditemukan</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1E716A] text-white rounded-lg text-sm font-medium hover:bg-[#1E716A]/90 transition-colors">
          <Plus size={16} /> Tambah Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#173B39]/10 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#173B39]/40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari desa, indikator…" className="pl-9 pr-3 py-2 w-full border border-[#173B39]/15 rounded-lg text-sm text-[#173B39] placeholder:text-[#173B39]/40 focus:outline-none focus:ring-1 focus:ring-[#1E716A]" />
        </div>
        <select value={filterDesa} onChange={e => { setFilterDesa(e.target.value); setPage(1); }} className="px-3 py-2 border border-[#173B39]/15 rounded-lg text-sm text-[#173B39] focus:outline-none focus:ring-1 focus:ring-[#1E716A] min-w-[160px]">
          <option value="">Semua Desa</option>
          {desas.map(d => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
        </select>
        <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(1); }} className="px-3 py-2 border border-[#173B39]/15 rounded-lg text-sm text-[#173B39] focus:outline-none focus:ring-1 focus:ring-[#1E716A]">
          <option value="">Semua Tahun</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#173B39]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF3F0] text-[#173B39]/70 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Desa</th>
                <th className="px-4 py-3 text-left">Indikator</th>
                <th className="px-4 py-3 text-center">Bulan/Tahun</th>
                <th className="px-4 py-3 text-right">Nilai</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-t border-[#173B39]/5">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#D9E8E5] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#173B39]/50 text-sm">
                    <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                    Belum ada data. Klik <strong>Tambah Data</strong> untuk memulai.
                  </td>
                </tr>
              ) : (
                paginated.map(row => (
                  <tr key={row.id} className="border-t border-[#173B39]/5 hover:bg-[#EEF3F0]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#173B39]">{desaMap.get(row.desa_id) ?? row.desa_id}</td>
                    <td className="px-4 py-3 text-[#173B39]/80">{indMap.get(row.indikator_id) ?? row.indikator_id}</td>
                    <td className="px-4 py-3 text-center text-[#173B39]/70">{MONTHS[(row.bulan ?? 1) - 1]} {row.tahun}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#173B39]">{row.nilai?.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(row)} className="p-1.5 rounded text-[#1E716A] hover:bg-[#1E716A]/10 transition-colors" aria-label="Edit"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(row.id)} disabled={deleteId === row.id} className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40" aria-label="Hapus"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Modal */}
      <FormModal isOpen={modalOpen} title={editId ? 'Edit Data Monografi' : 'Tambah Data Monografi'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Desa</label>
              <select required value={form.desa_id} onChange={e => setForm(f => ({ ...f, desa_id: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]">
                <option value="" disabled>-- Pilih Desa --</option>
                {desas.map(d => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Indikator</label>
              <select required value={form.indikator_id} onChange={e => setForm(f => ({ ...f, indikator_id: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]">
                <option value="" disabled>-- Pilih Indikator --</option>
                {indikators.map(i => <option key={i.id} value={i.id}>{i.nama_indikator} ({i.satuan})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Bulan</label>
              <select required value={form.bulan} onChange={e => setForm(f => ({ ...f, bulan: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]">
                {MONTHS.map((m, idx) => <option key={idx + 1} value={idx + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Tahun</label>
              <input type="number" required min={2000} max={2100} value={form.tahun} onChange={e => setForm(f => ({ ...f, tahun: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Nilai</label>
              <input type="number" step="any" required value={form.nilai} onChange={e => setForm(f => ({ ...f, nilai: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-[#173B39]/70 border border-[#173B39]/20 rounded-lg hover:bg-[#EEF3F0] transition-colors">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#1E716A] text-white rounded-lg hover:bg-[#1E716A]/90 transition-colors disabled:opacity-50">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
