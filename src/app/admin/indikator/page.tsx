'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';
import { FormModal } from '@/components/admin/FormModal';
import { MasterIndikator } from '@/types/database';

const PAGE_SIZE = 10;

const FIELD_KEY_OPTIONS = [
  { value: '', label: '— Tidak dipetakan —' },
  { value: 'population', label: 'population (Total Penduduk)' },
  { value: 'malePopulation', label: 'malePopulation (Penduduk L)' },
  { value: 'femalePopulation', label: 'femalePopulation (Penduduk P)' },
  { value: 'households', label: 'households (Jumlah KK)' },
  { value: 'areaKm2', label: 'areaKm2 (Luas Wilayah km²)' },
  { value: 'schools', label: 'schools (Jumlah Sekolah)' },
  { value: 'healthFacilities', label: 'healthFacilities (Fasilitas Kesehatan)' },
  { value: 'worshipPlaces', label: 'worshipPlaces (Tempat Ibadah)' },
  { value: 'umkm', label: 'umkm (Jumlah UMKM)' },
  { value: 'agriculture', label: 'agriculture (Pertanian)' },
  { value: 'industry', label: 'industry (Industri)' },
];

interface FormState {
  nama_indikator: string;
  satuan: string;
  field_key: string;
  is_active: boolean;
}

const defaultForm = (): FormState => ({ nama_indikator: '', satuan: '', field_key: '', is_active: true });

export default function IndikatorPage() {
  const [items, setItems] = useState<MasterIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/indikator?all=1');
      const json = await res.json();
      setItems(json.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() =>
    items.filter(i => !search || i.nama_indikator.toLowerCase().includes(search.toLowerCase()) || (i.satuan || '').toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditId(null); setForm(defaultForm()); setModalOpen(true); };
  const openEdit = (item: MasterIndikator) => {
    setEditId(item.id);
    setForm({ nama_indikator: item.nama_indikator, satuan: item.satuan, field_key: item.field_key || '', is_active: item.is_active });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/indikator/${editId}` : '/api/indikator';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setModalOpen(false); fetchAll(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus indikator ini? Data monografi yang terkait tidak akan terhapus.')) return;
    setDeleteId(id);
    await fetch(`/api/indikator/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchAll();
  };

  const handleToggle = async (item: MasterIndikator) => {
    await fetch(`/api/indikator/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    fetchAll();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#173B39] flex items-center gap-2">
            <BookOpen size={20} className="text-[#1E716A]" />
            Master Indikator
          </h1>
          <p className="text-sm text-[#173B39]/60 mt-0.5">{items.length} indikator terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1E716A] text-white rounded-lg text-sm font-medium hover:bg-[#1E716A]/90 transition-colors">
          <Plus size={16} /> Tambah Indikator
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#173B39]/10 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#173B39]/40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama indikator…" className="pl-9 pr-3 py-2 w-full border border-[#173B39]/15 rounded-lg text-sm text-[#173B39] placeholder:text-[#173B39]/40 focus:outline-none focus:ring-1 focus:ring-[#1E716A]" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#173B39]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF3F0] text-[#173B39]/70 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nama Indikator</th>
                <th className="px-4 py-3 text-left">Satuan</th>
                <th className="px-4 py-3 text-left">Field Peta</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#173B39]/5">
                    {Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#D9E8E5] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#173B39]/50 text-sm"><BookOpen size={32} className="mx-auto mb-2 opacity-30" />Belum ada indikator.</td></tr>
              ) : paginated.map(item => (
                <tr key={item.id} className="border-t border-[#173B39]/5 hover:bg-[#EEF3F0]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#173B39]/60">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-[#173B39]">{item.nama_indikator}</td>
                  <td className="px-4 py-3 text-[#173B39]/70">{item.satuan}</td>
                  <td className="px-4 py-3">
                    {item.field_key ? (
                      <span className="inline-flex px-2 py-0.5 bg-[#1E716A]/10 text-[#1E716A] text-xs rounded font-mono">{item.field_key}</span>
                    ) : (
                      <span className="text-[#173B39]/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(item)} className="inline-flex items-center gap-1.5 text-xs" aria-label={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                      {item.is_active
                        ? <><ToggleRight size={20} className="text-[#1E716A]" /><span className="text-[#1E716A]">Aktif</span></>
                        : <><ToggleLeft size={20} className="text-[#173B39]/40" /><span className="text-[#173B39]/40">Nonaktif</span></>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded text-[#1E716A] hover:bg-[#1E716A]/10 transition-colors" aria-label="Edit"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deleteId === item.id} className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40" aria-label="Hapus"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <FormModal isOpen={modalOpen} title={editId ? 'Edit Indikator' : 'Tambah Indikator'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Nama Indikator</label>
            <input required value={form.nama_indikator} onChange={e => setForm(f => ({ ...f, nama_indikator: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" placeholder="Jumlah Penduduk" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Satuan</label>
            <input required value={form.satuan} onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" placeholder="Jiwa" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Pemetaan ke Field Peta</label>
            <select value={form.field_key} onChange={e => setForm(f => ({ ...f, field_key: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]">
              {FIELD_KEY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="mt-1 text-xs text-[#173B39]/50">Data indikator ini akan ditampilkan di dialog peta saat desa diklik.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active_chk" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-[#1E716A]" />
            <label htmlFor="is_active_chk" className="text-sm text-[#173B39]/80">Indikator Aktif</label>
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
