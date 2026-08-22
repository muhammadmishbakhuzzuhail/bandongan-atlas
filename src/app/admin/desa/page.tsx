'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { Pagination } from '@/components/admin/Pagination';
import { FormModal } from '@/components/admin/FormModal';
import { MasterDesa } from '@/types/database';
import { AdminHeader, AdminFilterContainer, AdminSearchInput, AdminTableContainer, AdminTableHead, AdminTh, AdminSortIcon, AdminTr, AdminTd, AdminButton, AdminTableSkeleton, AdminEmptyRow } from '@/components/admin/TableLayout';

const PAGE_SIZE = 10;

interface FormState {
  id: string;
  nama_desa: string;
  slug: string;
  nama_kecamatan: string;
}

const defaultForm = (): FormState => ({ id: '', nama_desa: '', slug: '', nama_kecamatan: 'Kecamatan Bandongan' });

type SortColumn = 'id' | 'nama' | 'slug';

export default function DesaPage() {
  const [items, setItems] = useState<MasterDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [sortCol, setSortCol] = useState<SortColumn>('nama');
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/desa');
      const json = await res.json();
      setItems(json.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredAndSorted = useMemo(() => {
    const filtered = items.filter(i =>
      !search ||
      i.nama_desa.toLowerCase().includes(search.toLowerCase()) ||
      i.id.includes(search)
    );

    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortCol === 'nama') cmp = a.nama_desa.localeCompare(b.nama_desa);
      else if (sortCol === 'slug') cmp = a.slug.localeCompare(b.slug);

      return sortAsc ? cmp : -cmp;
    });
  }, [items, search, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      const res = await fetchApi(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { setModalOpen(false); fetchAll(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus desa ini dari master? Data monografi yang terkait tidak akan terhapus.')) return;
    setDeleteId(id);
    await fetchApi(`/api/desa/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchAll();
  };

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Master Desa"
        subtitle={`${filteredAndSorted.length} desa terdaftar`}
        action={<AdminButton onClick={openAdd}>Tambah +</AdminButton>}
      />

      <AdminFilterContainer>
        <AdminSearchInput
          value={search}
          onChange={val => { setSearch(val); setPage(1); }}
          placeholder="Cari nama desa atau ID..."
        />
      </AdminFilterContainer>

      <AdminTableContainer currentPage={page} totalPages={totalPages} onPageChange={setPage}>
        <AdminTableHead>
          <AdminTh className="text-left" onClick={() => handleSort('id')} sortable>ID <AdminSortIcon active={sortCol === 'id'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left" onClick={() => handleSort('nama')} sortable>Nama Desa <AdminSortIcon active={sortCol === 'nama'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left" onClick={() => handleSort('slug')} sortable>Slug <AdminSortIcon active={sortCol === 'slug'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left">Kecamatan</AdminTh>
          <AdminTh className="text-center">Aksi</AdminTh>
        </AdminTableHead>
        <tbody>
          {loading ? (
            <AdminTableSkeleton rows={PAGE_SIZE} cols={5} />
          ) : paginated.length === 0 ? (
            <AdminEmptyRow colSpan={5}>
              Belum ada data desa. Klik <strong className="text-[#173B39]">Tambah +</strong> untuk memulai.
            </AdminEmptyRow>
          ) : (
            paginated.map(item => (
              <AdminTr key={item.id}>
                <AdminTd className="font-mono text-sm text-[#173B39]/60">{item.id}</AdminTd>
                <AdminTd className="font-medium text-[#173B39] text-[0.9rem]">{item.nama_desa}</AdminTd>
                <AdminTd className="font-mono text-sm text-[#173B39]/60">{item.slug}</AdminTd>
                <AdminTd className="text-[#173B39]/70 text-[0.9rem]">{item.nama_kecamatan}</AdminTd>
                <AdminTd>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-[#1E716A] hover:bg-[#1E716A]/10 transition-colors" aria-label="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} disabled={deleteId === item.id} className="p-2 rounded-lg text-[#a8453f] hover:bg-[#a8453f]/10 transition-colors disabled:opacity-40" aria-label="Hapus"><Trash2 size={16} /></button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))
          )}
        </tbody>
      </AdminTableContainer>

      <FormModal isOpen={modalOpen} title={editId ? 'Edit Data Desa' : 'Tambah Desa Baru'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          {!editId && (
            <div>
              <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">ID Kemendagri (10 digit)</label>
              <input required value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" placeholder="3308142015" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Nama Desa</label>
            <input required value={form.nama_desa} onChange={e => setForm(f => ({ ...f, nama_desa: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" placeholder="Contoh: Bandongan" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Slug (URL)</label>
            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" placeholder="bandongan" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Kecamatan</label>
            <input required value={form.nama_kecamatan} onChange={e => setForm(f => ({ ...f, nama_kecamatan: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" placeholder="Kecamatan Bandongan" />
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
