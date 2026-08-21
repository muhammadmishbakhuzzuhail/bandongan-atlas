'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, MapPin, Search } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';
import { FormModal } from '@/components/admin/FormModal';
import { MasterDesa } from '@/types/database';

const PAGE_SIZE = 10;

interface FormState {
  id: string;
  nama_desa: string;
  slug: string;
  nama_kecamatan: string;
}

const defaultForm = (): FormState => ({ id: '', nama_desa: '', slug: '', nama_kecamatan: 'Kecamatan Bandongan' });

export default function DesaPage() {
  const [items, setItems] = useState<MasterDesa[]>([]);
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
      const res = await fetch('/api/desa');
      const json = await res.json();
      setItems(json.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() =>
    items.filter(i => !search || i.nama_desa.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search)),
    [items, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditId(null); setForm(defaultForm()); setModalOpen(true); };
  const openEdit = (item: MasterDesa) => {
    setEditId(item.id);
    setForm({ id: item.id, nama_desa: item.nama_desa, slug: item.slug, nama_kecamatan: item.nama_kecamatan });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/desa/${editId}` : '/api/desa';
      const method = editId ? 'PUT' : 'POST';
      const body = editId
        ? { nama_desa: form.nama_desa, slug: form.slug, nama_kecamatan: form.nama_kecamatan }
        : form;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { setModalOpen(false); fetchAll(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus desa ini dari master? Data monografi yang terkait tidak akan terhapus.')) return;
    setDeleteId(id);
    await fetch(`/api/desa/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchAll();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#173B39] flex items-center gap-2">
            <MapPin size={20} className="text-[#1E716A]" />
            Master Desa
          </h1>
          <p className="text-sm text-[#173B39]/60 mt-0.5">{items.length} desa terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#1E716A] text-white rounded-lg text-sm font-medium hover:bg-[#1E716A]/90 transition-colors">
          <Plus size={16} /> Tambah Desa
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#173B39]/10 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#173B39]/40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama desa atau ID…" className="pl-9 pr-3 py-2 w-full border border-[#173B39]/15 rounded-lg text-sm text-[#173B39] placeholder:text-[#173B39]/40 focus:outline-none focus:ring-1 focus:ring-[#1E716A]" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#173B39]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF3F0] text-[#173B39]/70 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3 text-left">ID (Kemendagri)</th>
                <th className="px-4 py-3 text-left">Nama Desa</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Kecamatan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#173B39]/5">
                    {Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-[#D9E8E5] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#173B39]/50 text-sm"><MapPin size={32} className="mx-auto mb-2 opacity-30" />Belum ada data desa.</td></tr>
              ) : paginated.map(item => (
                <tr key={item.id} className="border-t border-[#173B39]/5 hover:bg-[#EEF3F0]/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#173B39]/60">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-[#173B39]">{item.nama_desa}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#173B39]/60">{item.slug}</td>
                  <td className="px-4 py-3 text-[#173B39]/70">{item.nama_kecamatan}</td>
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

      <FormModal isOpen={modalOpen} title={editId ? 'Edit Data Desa' : 'Tambah Desa Baru'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          {!editId && (
            <div>
              <label className="block text-xs font-medium text-[#173B39]/70 mb-1">ID Kemendagri (10 digit)</label>
              <input required value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" placeholder="3308142015" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Nama Desa</label>
            <input required value={form.nama_desa} onChange={e => setForm(f => ({ ...f, nama_desa: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" placeholder="Bandongan" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Slug (URL)</label>
            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" placeholder="bandongan" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#173B39]/70 mb-1">Kecamatan</label>
            <input required value={form.nama_kecamatan} onChange={e => setForm(f => ({ ...f, nama_kecamatan: e.target.value }))} className="w-full px-3 py-2 border border-[#173B39]/20 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1E716A] text-[#173B39]" placeholder="Kecamatan Bandongan" />
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
